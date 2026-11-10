import * as migration_20261110_100459_initial from './20261110_100459_initial';

export const migrations = [
  {
    up: migration_20261110_100459_initial.up,
    down: migration_20261110_100459_initial.down,
    name: '20261110_100459_initial'
  },
];
