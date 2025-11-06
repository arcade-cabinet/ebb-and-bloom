import numpy as np

def simple_perlin(x, y, seed=0):
    np.random.seed(seed)
    return (np.sin(x * 0.1) * np.cos(y * 0.1) + np.random.rand() * 0.5) % 1

def perlin_heightmap(width, height, scale=10):
    grid = np.zeros((height, width))
    for i in range(height):
        for j in range(width):
            grid[i][j] = simple_perlin(i / scale, j / scale)
    return grid

def raycast(map_grid, player_pos, player_angle, fov=60, res=100):
    rays = []
    for i in range(res):
        ray_angle = player_angle + (fov / res * i) - (fov / 2)
        ray_dir = np.array([np.cos(ray_angle), np.sin(ray_angle)])
        dist = 0
        hit = False
        while not hit and dist < 20:
            x = int(player_pos[0] + ray_dir[0] * dist)
            y = int(player_pos[1] + ray_dir[1] * dist)
            if 0 <= x < map_grid.shape[1] and 0 <= y < map_grid.shape[0]:
                if map_grid[y][x] > 0.5:
                    hit = True
                    dist = dist / np.cos(ray_angle - player_angle) if np.cos(ray_angle - player_angle) != 0 else dist
            dist += 0.1
        rays.append(dist)
    return rays

# Gen map (seed=42 for determinism)
map_grid = perlin_heightmap(32, 32, scale=5)

# Player start (center, facing 0 rad)
player_pos = np.array([16.0, 16.0])
player_angle = 0

# Cast rays
rays = raycast(map_grid, player_pos, player_angle)

# Output
print("POC generated: Map shape", map_grid.shape)
print("Map sample (top-left 3x3):\n", map_grid[0:3, 0:3])
print("Rays length", len(rays))
print("Sample rays (first 5):", rays[:5])
print("Average ray distance:", np.mean(rays))
print("Max ray distance:", np.max(rays))