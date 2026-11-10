# Media demonstrative (seed local)

Folosite **doar** de `pnpm seed:dev`, ca să se vadă secțiunile cu fotografie și buclă video. Nu sunt fotografii cu Daniel sau cu
jucătorii lui; persoanele nu sunt identificabile (filmate de sus sau din spate). Înainte de lansare se înlocuiesc cu materiale proprii.

| Fișier | Sursă | Licență |
|---|---|---|
| `serviciu-mixkit-878*`, `serva-sus-mixkit-878.jpg`, `asteptare-mixkit-878.jpg` | Mixkit — „Man serving tennis ball” (clip 878) | Mixkit Stock Video Free License (uz comercial permis, fără atribuire obligatorie) |
| `serva-aerian-mixkit-879*`, `lovitura-aerian-mixkit-879.jpg` | Mixkit — „Tennis serve aerial view” (clip 879) | Mixkit Stock Video Free License |
| `teren-aerian-mixkit-880*`, `schimb-aerian-mixkit-880.jpg` | Mixkit — „Two people playing tennis aerial view” (clip 880) | Mixkit Stock Video Free License |

Prelucrare: tăiate la 8 s, fără sunet, H.264 720p (`ffmpeg … -an -crf 27 -movflags +faststart`); imaginile `.jpg` sunt cadre din clipuri.
Licența a fost citită din descrierile paginilor Mixkit (10.11.2026); de reverificat pe pagina fiecărui clip înainte de folosirea în producție.
Licența Mixkit nu permite redistribuirea clipurilor ca fișiere de sine stătătoare — nu le publica separat de site.
