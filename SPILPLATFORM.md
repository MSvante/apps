# Indsendelse til Spilplatform

Guide: https://frederikahlerscolumbus.github.io/spilplatform/#/guide

Hvert spil indsendes for sig med formularen "Tilføj dit spil". Felterne nedenfor kan kopieres direkte.
Grænser: titel ≤ 60 tegn, kort beskrivelse ≤ 140 tegn, beskrivelse ≤ 2000 tegn.

## Tjekliste (guidens trin 3)

- [x] Offentlig `https://`-adresse (GitHub Pages: https://msvante.github.io/apps/)
- [x] Må vises i en iframe (GitHub Pages sender ingen `X-Frame-Options`)
- [x] Relative stier (`base: './'` i alle Vite-builds)
- [x] Starter uden login og fylder vinduet
- [x] "Menu"/"Back"-knappen sender `spilplatform:exit` til platformen, når spillet kører i en ramme
- [x] Coverbillede 16:9 (SVG i `covers/`, deployes til https://msvante.github.io/apps/covers/)

## PL Lineup Guesser

| Felt | Værdi |
|---|---|
| Titel | PL Lineup Guesser |
| Adresse | https://msvante.github.io/apps/lineup_guesser/ |
| Coverbillede | https://msvante.github.io/apps/covers/lineup_guesser.svg |
| Type | Sport |
| Kort beskrivelse | Gæt startopstillingen fra en tilfældig Premier League-kamp siden 2010. |
| Beskrivelse | Du får en tilfældig Premier League-kamp fra 2010 til i dag og skal gætte alle 11 spillere i det ene holds startopstilling. Skriv et navn – efternavn er nok. Hver rigtig spiller giver 10 point. Sidder du fast, kan du købe hints: nationalitet, alder, trøjenummer og forbogstav. Du kan filtrere på hold og årstal. Spillet er på engelsk. |

## Headline Hangman

| Felt | Værdi |
|---|---|
| Titel | Headline Hangman |
| Adresse | https://msvante.github.io/apps/hangman/ |
| Coverbillede | https://msvante.github.io/apps/covers/hangman.svg |
| Type | Puslespil |
| Kort beskrivelse | Hængerleg med dagens nyhedsoverskrifter – gæt det skjulte ord bogstav for bogstav. |
| Beskrivelse | Spillet henter friske nyhedsoverskrifter, og ét ord i hver overskrift er skjult. Gæt bogstaverne med tastaturet eller skærmen. Fem forkerte gæt, og overskriften er tabt. Du har tre hints pr. runde, som afslører et bogstav. Overskrifterne er på engelsk. |

## Daily Calendar Puzzle

| Felt | Værdi |
|---|---|
| Titel | Daily Calendar Puzzle |
| Adresse | https://msvante.github.io/apps/kalender/ |
| Coverbillede | https://msvante.github.io/apps/covers/kalender.svg |
| Type | Puslespil |
| Kort beskrivelse | Læg brikkerne på kalenderen, så kun dagens måned og dato er fri. Ny opgave hver dag. |
| Beskrivelse | En kalender med alle måneder og datoer og otte brikker. Drej og spejlvend brikkerne, og læg dem, så de dækker alle felter undtagen dagens måned og dato. |

## Who's That Pokémon?

| Felt | Værdi |
|---|---|
| Titel | Who's That Pokémon? |
| Adresse | https://msvante.github.io/apps/pokemon/ |
| Coverbillede | https://msvante.github.io/apps/covers/pokemon.svg |
| Type | Puslespil |
| Kort beskrivelse | Gæt Pokémonen ud fra dens silhuet. Hvor lang en stime kan du holde? |
| Beskrivelse | Du ser silhuetten af en Pokémon og vælger det rigtige navn blandt fire svar. Svarmulighederne er drilske, for de kommer ofte fra samme udviklingskæde. Hints (type eller delvis afsløring) koster point. Vælg generation, hold stimen i live, og slå din egen rekord. |
