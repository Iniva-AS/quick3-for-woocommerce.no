---
title: "Ordreflyt mellom Quick3 og WooCommerce"
description: "Få kontroll på hvordan ordre synkroniseres mellom Quick3 og WooCommerce"
pubDate: 2025-10-15
image: "/blog/order-flow.png"
imageAlt: "Skjermbilde av Quick3 for WooCommerce installasjonsprosess"
authorName: "Ole Herland"
authorRole: "CEO, Iniva AS"
authorImage: "/authors/ole-herland.jpg"
draft: false
---

Når du kobler Quick3 til WooCommerce, håndteres hele ordreflyten automatisk fra
bestilling til levering. Her er en gjennomgang av hvordan det fungerer i praksis.

## Fra bestilling til Quick3

Så fort en kunde betaler i nettbutikken din, starter den automatiske synkroniseringen.
Betalingsleverandøren markerer ordren som betalt, og ordren går over til "Processing"
i WooCommerce. Da opprettes ordren automatisk i Quick3 med all nødvendig informasjon:
kundedetaljer, produkter, priser og betalingsinfo.

Alt skjer uten at du trenger å løfte en finger.

## Frakt og sporing

Når du legger til fraktinformasjon i Quick3, synkroniseres sporingsnummeret automatisk
tilbake til WooCommerce. Kunden får beskjed om sporingsinfo, og kan følge pakken sin på vei hjem.

## Fakturering og fullføring

Når du trykker "Fakturer" i Quick3, oppdateres ordrestatusen automatisk til "Fullført"
i WooCommerce. Kunden får en fullføringsbekreftelse, og ordren er ferdig håndtert.

Enkelt og oversiktlig.

## Returer

Returer starter du alltid fra WooCommerce. Når en retur opprettes der, synkroniseres
den automatisk til Quick3 som en ny ordre med negative beløp.
Lagerbeholdningen oppdateres automatisk når produktene kommer tilbake på lager.

**Tips**: Start alltid returer fra WooCommerce for å sikre korrekt synkronisering til Quick3.

## Kansellering av ordre

Ordre som ikke er fakturert kan kanselleres direkte fra WooCommerce. Da slettes
ordren automatisk fra Quick3, inkludert eventuelle tilhørende refunderingsordre.

**Viktig å vite:** Fakturerte ordre kan ikke kanselleres. Disse må håndteres som returer i stedet.

## Hva du bør vite om begrensninger

Quick3 sitt API har noen begrensninger som påvirker hva som er mulig:

- **Ordreoppdateringer:** Eksisterende ordre kan ikke endres etter at de er opprettet i Quick3
- **Manuelle endringer:** Hvis du trenger å endre en ordre, må dette gjøres direkte i Quick3

Dette er ikke begrensninger i integrasjonen vår, men i Quick3 sitt API.
Så lenge du er klar over det, er det sjelden et problem i praksis.

## Starter du med integrasjonen?

Quick3 for WooCommerce leverer den automatiske ordreflyten mellom systemene.
Vi har priser som passer både små og store butikker – og du kan teste gratis med opptil 50 produkter.

Trenger du hjelp med oppsett eller implementasjon? Vi samarbeider tett med [veniro.no](https://veniro.no),
som kan hjelpe deg i gang med både teknisk oppsett og markedsføring.
