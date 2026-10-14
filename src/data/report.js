const Q = [
  "Ce que vous avez vraiment gagné ce mois-ci",
  "Ce que vos décisions du mois dernier vous ont rapporté",
  "Jusqu'à quand votre trésorerie vous porte",
  "D'où vient l'écart avec ce que vous aviez prévu",
  "Les clients qui s'éloignent, avant de les perdre",
  "Ce que vous faites ce mois-ci, et ce que ça vous rapporte",
];

export const QUESTIONS = Q;

export const REPORTS = {
  com: {
    who: 'Commerce, 6 salariés',
    a: [
      '4 860 € de résultat, contre 2 100 € en septembre dernier.',
      'La remise sur les fins de série a fait rentrer 3 200 € et écoulé 60 % du stock visé.',
      "Jusqu'à mi-décembre, toutes charges payées.",
      'Le fret a pris 18 % sur le dernier conteneur : 1 150 € de marge en moins.',
      "Trois clients professionnels n'ont rien commandé depuis août : 2 400 € en jeu.",
      'Les trois actions ci-dessous.',
    ],
    acts: [
      'Rappeler les trois clients professionnels avant le 15 : 2 400 € à récupérer.',
      'Remonter de 4 % le prix plancher de la gamme B : 900 € de plus par mois.',
      'Commander la gamme A avant le 20 pour ne pas manquer Noël.',
    ],
  },
  prod: {
    who: 'Production alimentaire, 9 salariés',
    a: [
      '1 350 € de résultat, pour 3 900 € prévus.',
      "La nouvelle référence en grande surface s'est vendue à 1 200 unités, 200 de plus que visé : 1 600 € de marge en plus.",
      "Jusqu'à fin janvier, si les deux grandes surfaces paient à 45 jours comme convenu.",
      "Les emballages importés ont pris 22 % et la ligne s'est arrêtée trois jours sur panne : 2 550 € d'écart.",
      'Un grossiste a réduit ses commandes de moitié : 2 800 € par mois en jeu. Les hôtels, eux, reprennent avec la saison.',
      'Les trois actions ci-dessous.',
    ],
    acts: [
      'Répercuter la hausse des emballages sur le prix de gros, 3 % : 1 100 € de plus par mois.',
      'Rencontrer le grossiste avant le 20 : 2 800 € de commandes mensuelles à reprendre.',
      "Faire l'entretien de la ligne avant la haute saison, pour ne plus perdre trois jours de production.",
    ],
  },
  serv: {
    who: 'Services aux entreprises, 4 salariés',
    a: [
      '2 940 € de résultat, contre 1 800 € en septembre dernier.',
      "La relance des devis en attente a fait signer trois chantiers sur sept : 8 400 € de chiffre d'affaires.",
      "Jusqu'à fin novembre. Les 11 200 € de factures de plus de 60 jours vous emmènent bien au-delà, une fois encaissés.",
      '62 % des heures payées ont été facturées, pour 75 % visés : trop de route entre deux interventions, soit 20 heures perdues.',
      'Un client de longue date est parti. Deux syndics, eux, ont confié leur entretien annuel.',
      'Les trois actions ci-dessous.',
    ],
    acts: [
      'Relancer les quatre factures de plus de 60 jours avant le 10 : 11 200 € à encaisser.',
      'Regrouper les interventions par secteur : 20 heures facturables de plus par mois.',
      "Proposer un contrat d'entretien aux cinq plus gros clients : 1 500 € par mois.",
    ],
  },
  art: {
    who: 'Artisan électricien, 3 salariés',
    a: [
      '2 150 € de résultat, pour 3 400 € prévus.',
      "L'acompte de 30 % demandé à la signature a fait rentrer 4 200 € avant le début des travaux.",
      "Jusqu'à mi-janvier, si les deux situations de travaux en attente sont réglées ce mois-ci.",
      "Deux journées de reprise sur un chantier livré, non facturées, et des fournitures achetées au comptoir en urgence : 1 250 € d'écart.",
      "Un promoteur qui vous confiait un chantier par trimestre n'a rien demandé depuis juin : 6 000 € de travaux en jeu.",
      'Les trois actions ci-dessous.',
    ],
    acts: [
      'Facturer chaque dépannage le jour même, avant de quitter le client : 900 € par mois qui ne se perdent plus.',
      'Grouper les commandes de fournitures une fois par semaine chez le grossiste : 400 € de remise par mois.',
      'Appeler le promoteur avant le 15 : 6 000 € de travaux à reprendre.',
    ],
  },
};

/** Typographie française : espaces insécables, montants mis en valeur. */
export function frTypo(str) {
  const esc = str.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return esc
    .replace(/(\d) (\d{3})/g, '$1 $2')
    .replace(/ ([:;!?])/g, ' $1')
    .replace(/(\d+(?: \d{3})*) (€|%)/g, '<b class="eur">$1 $2</b>');
}
