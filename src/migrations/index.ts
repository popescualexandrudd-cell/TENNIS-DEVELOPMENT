import * as migration_20261110_100459_initial from './20261110_100459_initial';
import * as migration_20261110_103117_home_facts_testimonials_service_image from './20261110_103117_home_facts_testimonials_service_image';
import * as migration_20261110_133409_media_video_poster_method_media from './20261110_133409_media_video_poster_method_media';
import * as migration_20261110_142643_testimonials_submissions from './20261110_142643_testimonials_submissions';
import * as migration_20261110_152821_legal_settings from './20261110_152821_legal_settings';

export const migrations = [
  {
    up: migration_20261110_100459_initial.up,
    down: migration_20261110_100459_initial.down,
    name: '20261110_100459_initial',
  },
  {
    up: migration_20261110_103117_home_facts_testimonials_service_image.up,
    down: migration_20261110_103117_home_facts_testimonials_service_image.down,
    name: '20261110_103117_home_facts_testimonials_service_image',
  },
  {
    up: migration_20261110_133409_media_video_poster_method_media.up,
    down: migration_20261110_133409_media_video_poster_method_media.down,
    name: '20261110_133409_media_video_poster_method_media',
  },
  {
    up: migration_20261110_142643_testimonials_submissions.up,
    down: migration_20261110_142643_testimonials_submissions.down,
    name: '20261110_142643_testimonials_submissions',
  },
  {
    up: migration_20261110_152821_legal_settings.up,
    down: migration_20261110_152821_legal_settings.down,
    name: '20261110_152821_legal_settings'
  },
];
