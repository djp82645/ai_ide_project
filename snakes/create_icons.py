from PIL import Image, ImageDraw

def create_snake_icon(size):
    # 创建一个新的图片，使用RGBA模式支持透明度
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 计算网格大小
    grid_size = size // 4
    
    # 画蛇身（绿色）
    snake_color = (76, 175, 80, 255)  # Material Design Green 500
    segments = [(1, 1), (2, 1), (2, 2), (2, 3)]
    
    for x, y in segments:
        draw.rectangle(
            [x * grid_size, y * grid_size, 
             (x + 1) * grid_size - 1, (y + 1) * grid_size - 1],
            fill=snake_color
        )
    
    # 画食物（红色）
    food_color = (244, 67, 54, 255)  # Material Design Red 500
    draw.rectangle(
        [0, 3 * grid_size, 
         grid_size - 1, 4 * grid_size - 1],
        fill=food_color
    )
    
    return img

# 生成三种尺寸的图标
sizes = [16, 48, 128]
for size in sizes:
    icon = create_snake_icon(size)
    icon.save(f'images/icon{size}.png') 