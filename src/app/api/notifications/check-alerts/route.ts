/**
 * 가격 알림 조건 체크 API (Cron Job용)
 *
 * 모든 활성 가격 알림의 조건을 체크하고,
 * 조건 충족 시 푸시 알림을 발송합니다.
 *
 * ============================================================
 * 엔드포인트: GET /api/notifications/check-alerts
 * ============================================================
 *
 * Vercel Cron Job으로 1분마다 호출됩니다.
 *
 * ============================================================
 * 동작 방식:
 * ============================================================
 * 1. 모든 활성 알림 조회 (isActive=true, isTriggered=false)
 * 2. 종목별로 현재가 조회
 * 3. 각 알림의 조건 체크 (above/below)
 * 4. 조건 충족 시:
 *    - 알림을 isTriggered=true로 업데이트
 *    - 푸시 알림 활성화된 사용자에게 FCM 발송
 * 5. 결과 반환
 *
 * ============================================================
 * 보안:
 * ============================================================
 * - Vercel Cron 인증 헤더 확인
 * - CRON_SECRET 환경변수로 보호
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * 알림 데이터 타입
 */
interface AlertData {
  id: string;
  userId: string;
  ticker: string;
  market: 'KR' | 'US';
  stockName: string;
  targetPrice: number;
  direction: 'above' | 'below';
  isActive: boolean;
  isTriggered: boolean;
}

/**
 * 가격 데이터 캐시 (중복 API 호출 방지)
 */
interface PriceCache {
  [key: string]: {
    currentPrice: number;
    fetchedAt: number;
  };
}

/**
 * GET /api/notifications/check-alerts
 *
 * Cron Job에서 호출되어 모든 활성 알림을 체크합니다.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('[CheckAlerts] ===== 알림 체크 시작 =====');

  try {
    // Cron 인증 확인 (Vercel Cron Job 헤더)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // 프로덕션 환경에서 인증 필수
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.log('[CheckAlerts] 인증 실패');
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // 1. 모든 활성 알림 조회
    console.log('[CheckAlerts] 1. 활성 알림 조회...');
    const alertsSnapshot = await adminDb
      .collection('price_alerts')
      .where('isActive', '==', true)
      .where('isTriggered', '==', false)
      .get();

    if (alertsSnapshot.empty) {
      console.log('[CheckAlerts] 활성 알림 없음');
      return NextResponse.json({
        success: true,
        message: '활성 알림 없음',
        checked: 0,
        triggered: 0,
        duration: Date.now() - startTime,
      });
    }

    const alerts: AlertData[] = alertsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<AlertData, 'id'>),
    }));

    console.log('[CheckAlerts] 활성 알림 수:', alerts.length);

    // 2. 종목별로 그룹화 (API 호출 최적화)
    const alertsByTicker: Record<string, AlertData[]> = {};
    alerts.forEach((alert) => {
      const key = `${alert.market}:${alert.ticker}`;
      if (!alertsByTicker[key]) {
        alertsByTicker[key] = [];
      }
      alertsByTicker[key].push(alert);
    });

    const tickerKeys = Object.keys(alertsByTicker);
    console.log('[CheckAlerts] 2. 종목 수:', tickerKeys.length);

    // 3. 각 종목의 현재가 조회
    console.log('[CheckAlerts] 3. 현재가 조회 중...');
    const priceCache: PriceCache = {};
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tickerbird.vercel.app';

    // 병렬 처리 (5개씩)
    const CHUNK_SIZE = 5;
    for (let i = 0; i < tickerKeys.length; i += CHUNK_SIZE) {
      const chunk = tickerKeys.slice(i, i + CHUNK_SIZE);
      const promises = chunk.map(async (key) => {
        const [market, ticker] = key.split(':');
        try {
          let url: string;
          if (market === 'KR') {
            url = `${baseUrl}/api/kis/stock/price?symbol=${ticker}`;
          } else {
            url = `${baseUrl}/api/kis/overseas/stock/price?symbol=${ticker}`;
          }

          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.currentPrice) {
              priceCache[key] = {
                currentPrice: data.currentPrice,
                fetchedAt: Date.now(),
              };
            }
          }
        } catch (error) {
          console.error(`[CheckAlerts] 가격 조회 실패: ${key}`, error);
        }
      });

      await Promise.all(promises);

      // 레이트 리밋 방지
      if (i + CHUNK_SIZE < tickerKeys.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log('[CheckAlerts] 가격 조회 완료:', Object.keys(priceCache).length);

    // 4. 각 알림 조건 체크
    console.log('[CheckAlerts] 4. 조건 체크 중...');
    const triggeredAlerts: AlertData[] = [];

    alerts.forEach((alert) => {
      const key = `${alert.market}:${alert.ticker}`;
      const priceData = priceCache[key];

      if (!priceData) {
        return; // 가격 데이터 없으면 스킵
      }

      const currentPrice = priceData.currentPrice;
      let isConditionMet = false;

      if (alert.direction === 'above' && currentPrice >= alert.targetPrice) {
        isConditionMet = true;
      } else if (alert.direction === 'below' && currentPrice <= alert.targetPrice) {
        isConditionMet = true;
      }

      if (isConditionMet) {
        triggeredAlerts.push(alert);
        console.log('[CheckAlerts] 조건 충족:', {
          ticker: alert.ticker,
          target: alert.targetPrice,
          current: currentPrice,
          direction: alert.direction,
        });
      }
    });

    console.log('[CheckAlerts] 발동 알림 수:', triggeredAlerts.length);

    // 5. 발동된 알림 처리
    if (triggeredAlerts.length > 0) {
      console.log('[CheckAlerts] 5. 알림 발동 처리...');

      // 사용자별 알림 그룹화
      const alertsByUser: Record<string, AlertData[]> = {};
      triggeredAlerts.forEach((alert) => {
        if (!alertsByUser[alert.userId]) {
          alertsByUser[alert.userId] = [];
        }
        alertsByUser[alert.userId].push(alert);
      });

      // 각 사용자에게 푸시 알림 발송
      for (const [userId, userAlerts] of Object.entries(alertsByUser)) {
        // 푸시 알림 설정 확인
        const settingsDoc = await adminDb
          .collection('users')
          .doc(userId)
          .collection('settings')
          .doc('pushNotification')
          .get();

        const isPushEnabled = settingsDoc.exists && settingsDoc.data()?.enabled === true;

        for (const alert of userAlerts) {
          // Firestore 업데이트 (isTriggered = true)
          await adminDb.collection('price_alerts').doc(alert.id).update({
            isTriggered: true,
            triggeredAt: new Date(),
          });

          // 푸시 알림 발송 (활성화된 경우만)
          if (isPushEnabled) {
            try {
              const priceKey = `${alert.market}:${alert.ticker}`;
              const currentPrice = priceCache[priceKey]?.currentPrice || alert.targetPrice;

              // 가격 포맷팅
              const formattedPrice =
                alert.market === 'KR'
                  ? `${currentPrice.toLocaleString('ko-KR')}원`
                  : `$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

              const formattedTarget =
                alert.market === 'KR'
                  ? `${alert.targetPrice.toLocaleString('ko-KR')}원`
                  : `$${alert.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

              const direction = alert.direction === 'above' ? '상승' : '하락';

              await fetch(`${baseUrl}/api/notifications/send-push`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId,
                  title: `📈 ${alert.stockName} 목표가 ${direction}!`,
                  body: `${alert.stockName}이(가) ${formattedPrice}에 도달했습니다. (목표가: ${formattedTarget})`,
                  data: {
                    ticker: alert.ticker,
                    market: alert.market,
                    alertId: alert.id,
                  },
                }),
              });

              console.log('[CheckAlerts] 푸시 발송:', {
                userId,
                ticker: alert.ticker,
              });
            } catch (pushError) {
              console.error('[CheckAlerts] 푸시 발송 실패:', pushError);
            }
          }
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log('[CheckAlerts] ===== 알림 체크 완료 =====', {
      checked: alerts.length,
      triggered: triggeredAlerts.length,
      duration: `${duration}ms`,
    });

    return NextResponse.json({
      success: true,
      checked: alerts.length,
      triggered: triggeredAlerts.length,
      duration,
    });
  } catch (error) {
    console.error('[CheckAlerts] 에러:', error);
    return NextResponse.json(
      { success: false, error: '알림 체크 실패' },
      { status: 500 }
    );
  }
}
