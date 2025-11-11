import { setupAudioFixture } from './tests/fixtures/audioFixture.js';
import { CosmicAudioSonification } from './engine/audio/CosmicAudioSonification.js';
import { rngRegistry } from './engine/rng/RNGRegistry.js';

const audioFixture = setupAudioFixture();
console.log('Fixture setup:', typeof audioFixture);
console.log('AudioContext type:', typeof global.AudioContext);
console.log('mockNodes length before:', audioFixture.mockNodes.length);

const rng = rngRegistry.getScopedRNG('test');
const sonification = new CosmicAudioSonification(rng);
console.log('Sonification created');
console.log('mockNodes length after:', audioFixture.mockNodes.length);

sonification.playSoundForStage('planck-epoch', 0.5);
console.log('playSoundForStage called');
console.log('mockNodes length final:', audioFixture.mockNodes.length);
console.log('mockNodes:', audioFixture.mockNodes.map(n => n.type));
