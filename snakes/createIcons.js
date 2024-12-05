// 使用 Canvas 创建贪吃蛇图标
function createSnakeIcon(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 设置背景
  ctx.fillStyle = '#4CAF50';
  ctx.fillRect(0, 0, size, size);

  // 画蛇
  ctx.fillStyle = '#81C784';
  const segmentSize = Math.floor(size / 4);
  
  // 蛇身
  const segments = [
    {x: 1, y: 1},
    {x: 2, y: 1},
    {x: 2, y: 2},
    {x: 2, y: 3}
  ];

  segments.forEach(segment => {
    ctx.fillRect(
      segment.x * segmentSize, 
      segment.y * segmentSize, 
      segmentSize - 1, 
      segmentSize - 1
    );
  });

  // 食物
  ctx.fillStyle = '#F44336';
  ctx.fillRect(0, 3 * segmentSize, segmentSize - 1, segmentSize - 1);

  return canvas.toDataURL();
} 