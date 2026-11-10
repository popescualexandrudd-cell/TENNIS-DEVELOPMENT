import * as migration_20261110_100459_initial from './20261110_100459_initial';
import * as migration_20261110_103117_home_facts_testimonials_service_image from './20261110_103117_home_facts_testimonials_service_image';

export const migrations = [
  {
    up: migration_20261110_100459_initial.up,
    down: migration_20261110_100459_initial.down,
    name: '20261110_100459_initial',
  },
  {
    up: migration_20261110_103117_home_facts_testimonials_service_image.up,
    down: migration_20261110_103117_home_facts_testimonials_service_image.down,
    name: '20261110_103117_home_facts_testimonials_service_image'
  },
];
