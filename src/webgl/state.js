/* ------------------------------------------------------------------
   État pilotable par le scroll (GSAP écrit dedans, la boucle lit)
------------------------------------------------------------------ */
export const state = {
  speed: 0,        // 0..1  aiguille du compteur (ventes)
  fuel: 0.5,       // 0..1  aiguille de la jauge (ce qui reste)
  warn: 0,         // 0..1  voyant réserve
  backlight: 0,    // 0..1  rétro-éclairage des cadrans
  dials: 1,        // 0..1  présence des cadrans
  focusX: 0,       // -1 compteur, 0 centre, 1 jauge
  zoom: 1,         // 1 = cadrage complet
  tilt: 0,         // inclinaison caméra
  liftY: 0,        // décalage vertical du cadrage
  particles: 1,    // présence poussière d'or
  flow: 0.15,      // vitesse de dérive des particules
  color: 0,        // 0 = or, 1 = couleurs ADAM
  aberr: 0,        // aberration chromatique
  sat: 0.9,        // saturation finale
  fade: 0,         // fondu au noir
  shake: 0,        // tremblement caméra
  panX: 0,         // décale le cadrage (texte à gauche, cadran à droite)
  vel: 0,          // vitesse de scroll (aberration additionnelle)
};

