import * as THREE from 'three';

export interface LightUniforms {
  uLightPositions: { value: Float32Array };
  uLightColors: { value: Float32Array };
  uLightIntensities: { value: Float32Array };
  uLightTypes: { value: Float32Array };
  uLightCount: { value: number };
  uEnableShadows: { value: number };
  uShadowSoftness: { value: number };
  uEnableAO: { value: number };
}

export function extractLightUniforms(
  scene: THREE.Scene,
  enableShadows: boolean,
  shadowSoftness: number,
  enableAO: boolean
): LightUniforms {
  const MAX_LIGHTS = 8;
  const lightPositions: number[] = [];
  const lightColors: number[] = [];
  const lightIntensities: number[] = [];
  const lightTypes: number[] = [];
  let lightCount = 0;
  
  scene.traverse((obj) => {
    if (lightCount >= MAX_LIGHTS) return;
    
    if (obj instanceof THREE.DirectionalLight) {
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(obj.quaternion);
      lightPositions.push(dir.x, dir.y, dir.z);
      lightColors.push(obj.color.r, obj.color.g, obj.color.b);
      lightIntensities.push(obj.intensity);
      lightTypes.push(0);
      lightCount++;
    } else if (obj instanceof THREE.PointLight) {
      lightPositions.push(obj.position.x, obj.position.y, obj.position.z);
      lightColors.push(obj.color.r, obj.color.g, obj.color.b);
      lightIntensities.push(obj.intensity);
      lightTypes.push(1);
      lightCount++;
    } else if (obj instanceof THREE.SpotLight) {
      lightPositions.push(obj.position.x, obj.position.y, obj.position.z);
      lightColors.push(obj.color.r, obj.color.g, obj.color.b);
      lightIntensities.push(obj.intensity);
      lightTypes.push(2);
      lightCount++;
    } else if (obj instanceof THREE.AmbientLight) {
      if (lightCount === 0 || lightTypes[0] !== 3) {
        lightPositions.unshift(0, 0, 0);
        lightColors.unshift(obj.color.r, obj.color.g, obj.color.b);
        lightIntensities.unshift(obj.intensity);
        lightTypes.unshift(3);
        lightCount++;
      }
    }
  });
  
  while (lightPositions.length < MAX_LIGHTS * 3) {
    lightPositions.push(0, 0, 0);
    lightColors.push(0, 0, 0);
    lightIntensities.push(0);
    lightTypes.push(-1);
  }
  
  return {
    uLightPositions: { value: new Float32Array(lightPositions) },
    uLightColors: { value: new Float32Array(lightColors) },
    uLightIntensities: { value: new Float32Array(lightIntensities) },
    uLightTypes: { value: new Float32Array(lightTypes) },
    uLightCount: { value: lightCount },
    uEnableShadows: { value: enableShadows ? 1.0 : 0.0 },
    uShadowSoftness: { value: shadowSoftness },
    uEnableAO: { value: enableAO ? 1.0 : 0.0 }
  };
}
