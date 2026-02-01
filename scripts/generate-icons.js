/**
 * PWA 아이콘 생성 스크립트
 *
 * Canvas를 사용하여 다양한 크기의 PWA 아이콘을 생성합니다.
 *
 * 사용법: node scripts/generate-icons.js
 *
 * 생성되는 아이콘:
 * - 72x72, 96x96, 128x128, 144x144, 152x152 (작은 크기)
 * - 192x192 (Android 기본)
 * - 384x384, 512x512 (고해상도)
 * - 180x180 (Apple Touch Icon)
 * - 32x32, 16x16 (Favicon)
 */

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 아이콘 크기 목록
const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

// 출력 디렉토리
const outputDir = path.join(__dirname, '../public/icons');

// 디렉토리 확인 및 생성
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * 아이콘 그리기
 *
 * @param {number} size - 아이콘 크기 (픽셀)
 * @returns {Buffer} PNG 이미지 버퍼
 */
function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 배경 그라디언트 (파란색 계열)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b82f6');  // blue-500
  gradient.addColorStop(1, '#1d4ed8');  // blue-700

  // 둥근 사각형 배경
  const radius = size * 0.2;  // 20% 라운드
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // "T" 문자 그리기 (Tickerbird의 T)
  const fontSize = size * 0.55;
  ctx.font = `bold ${fontSize}px "SF Pro Display", "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('T', size / 2, size / 2 + size * 0.02);

  // 작은 차트 아이콘 (오른쪽 아래)
  if (size >= 96) {
    const chartSize = size * 0.25;
    const chartX = size * 0.65;
    const chartY = size * 0.65;

    // 상승 화살표/차트 라인
    ctx.strokeStyle = '#22c55e';  // green-500
    ctx.lineWidth = Math.max(2, size * 0.03);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(chartX, chartY + chartSize * 0.8);
    ctx.lineTo(chartX + chartSize * 0.4, chartY + chartSize * 0.3);
    ctx.lineTo(chartX + chartSize * 0.7, chartY + chartSize * 0.5);
    ctx.lineTo(chartX + chartSize, chartY);
    ctx.stroke();
  }

  return canvas.toBuffer('image/png');
}

/**
 * 모든 아이콘 생성
 */
function generateAllIcons() {
  console.log('PWA 아이콘 생성 시작...\n');

  sizes.forEach((size) => {
    const buffer = drawIcon(size);
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, buffer);
    console.log(`✓ ${filename} 생성 완료`);
  });

  // Apple Touch Icon (별도 이름)
  const appleTouchIcon = drawIcon(180);
  fs.writeFileSync(path.join(outputDir, 'apple-touch-icon.png'), appleTouchIcon);
  console.log('✓ apple-touch-icon.png 생성 완료');

  // Favicon
  const favicon16 = drawIcon(16);
  const favicon32 = drawIcon(32);
  fs.writeFileSync(path.join(outputDir, 'favicon-16x16.png'), favicon16);
  fs.writeFileSync(path.join(outputDir, 'favicon-32x32.png'), favicon32);
  console.log('✓ favicon-16x16.png 생성 완료');
  console.log('✓ favicon-32x32.png 생성 완료');

  console.log('\n아이콘 생성 완료!');
  console.log(`출력 디렉토리: ${outputDir}`);
}

// 실행
generateAllIcons();
