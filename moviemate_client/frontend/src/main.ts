import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'vidstack/player';
import 'vidstack/player/layouts/default';
import 'vidstack/player/ui';

import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true
})
  .catch(err => console.error(err));
