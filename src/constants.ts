import { Track } from './types';

export const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Pulse',
    artist: 'AI Synth Orchestra',
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a17286.mp3', // Placeholder synth track
    cover: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop',
    duration: 145,
  },
  {
    id: '2',
    title: 'Cyber Glitch',
    artist: 'Digital Dreamer',
    url: 'https://cdn.pixabay.com/audio/2021/11/23/audio_03494e43f4.mp3', // Placeholder glitch track
    cover: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?q=80&w=2070&auto=format&fit=crop',
    duration: 182,
  },
  {
    id: '3',
    title: 'Retro Drive',
    artist: 'Memory Cache',
    url: 'https://cdn.pixabay.com/audio/2023/10/25/audio_2491a67a84.mp3', // Placeholder drive track
    cover: 'https://images.unsplash.com/photo-1612359333333-e13d3e8e19e1?q=80&w=2070&auto=format&fit=crop',
    duration: 160,
  }
];

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 150;
export const MIN_SPEED = 60;
export const SPEED_INCREMENT = 2;
