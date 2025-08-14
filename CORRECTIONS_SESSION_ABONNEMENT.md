# 🔧 CORRECTIONS - Sessions avec Abonnements

## Problème identifié
L'erreur principale est que votre code essaie d'accéder à la colonne `Session.heureDebut` qui n'existe pas dans votre base de données. Votre modèle utilise `dateHeureDebut`.

## Corrections nécessaires

### 1. 🗄️ Correction AbonnementService.js
```javascript
// Dans la méthode getAbonnementById, remplacer :
{
  model: Session,
  as: 'sessions',
  order: [['heureDebut', 'DESC']], // ❌ ERREUR
  limit: 10
}

// Par :
{
  model: Session,
  as: 'sessions',
  order: [['dateHeureDebut', 'DESC']], // ✅ CORRECT
  limit: 10
}
```

### 2. 🔄 Amélioration SessionService.js
```javascript
// Ajouter méthode pour sessions avec abonnement
static async demarrerSessionAvecAbonnement(posteId, abonnementId, utilisateurId, options = {}) {
  const transaction = await sequelize.transaction();
  
  try {
    // 1. Vérifier disponibilité du poste
    await this.verifierDisponibilitePoste(posteId, transaction);
    
    // 2. Vérifier disponibilité de l'abonnement
    const { AbonnementService } = require('./AbonnementService');
    const dureeHeure = options.dureeEstimeeMinutes ? options.dureeEstimeeMinutes / 60 : 1;
    
    const availability = await AbonnementService.checkAbonnementAvailability(
      abonnementId, 
      dureeHeure
    );
    
    if (!availability.disponible) {
      throw createError(ErrorTypes.VALIDATION.INVALID_VALUE, availability.raison);
    }
    
    // 3. Créer la session
    const sessionData = {
      numeroSession: await this.genererNumeroSession(),
      posteId,
      abonnementId,
      clientId: availability.abonnement.clientId,
      utilisateurIdDemarrage: utilisateurId,
      dateHeureDebut: new Date(),
      dureeEstimeeMinutes: options.dureeEstimeeMinutes || 60,
      typeSession: 'ABONNEMENT',
      statut: 'EN_COURS',
      typeCalcul: 'ABONNEMENT',
      estPayee: true, // Payé via abonnement
      montantTotal: 0 // Pas de coût supplémentaire
    };
    
    const session = await Session.create(sessionData, { transaction });
    
    // 4. Mettre à jour le statut du poste
    await Poste.update(
      { statut: 'OCCUPE' },
      { where: { id: posteId }, transaction }
    );
    
    await transaction.commit();
    
    return await Session.findByPk(session.id, {
      include: [
        { model: Poste, as: 'poste', include: [{ model: TypePoste, as: 'typePoste' }] },
        { model: Client, as: 'client' },
        { model: User, as: 'utilisateurDemarrage' },
        { model: Abonnement, as: 'abonnement' }
      ]
    });
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Méthode pour terminer session avec abonnement
static async terminerSessionAvecAbonnement(sessionId, utilisateurIdCloture) {
  const transaction = await sequelize.transaction();
  
  try {
    const session = await Session.findByPk(sessionId, {
      include: [
        { model: Poste, as: 'poste' },
        { model: Abonnement, as: 'abonnement' }
      ],
      transaction
    });
    
    if (!session) {
      throw createError(ErrorTypes.GENERIC.NOT_FOUND, 'Session non trouvée');
    }
    
    if (session.statut !== 'EN_COURS' && session.statut !== 'EN_PAUSE') {
      throw createError(ErrorTypes.VALIDATION.INVALID_VALUE, 'Cette session ne peut pas être terminée');
    }
    
    // Calculer la durée réelle
    const dateFinEffective = new Date();
    const dureeReelleMs = dateFinEffective.getTime() - new Date(session.dateHeureDebut).getTime();
    const dureeReelleMinutes = Math.ceil(dureeReelleMs / (1000 * 60));
    const dureeReelleHeures = dureeReelleMinutes / 60;
    
    // Retirer le temps de pause
    const tempsPauseMinutes = session.tempsPauseTotalMinutes || 0;
    const dureeFacturableMinutes = Math.max(0, dureeReelleMinutes - tempsPauseMinutes);
    const dureeFacturableHeures = dureeFacturableMinutes / 60;
    
    // Consommer les heures de l'abonnement
    if (session.abonnementId && dureeFacturableHeures > 0) {
      const { AbonnementService } = require('./AbonnementService');
      await AbonnementService.consommerHeures(
        session.abonnementId,
        dureeFacturableHeures,
        session.id
      );
    }
    
    // Mettre à jour la session
    await session.update({
      dateHeureFin: dateFinEffective,
      dureeReelleMinutes: dureeFacturableMinutes,
      statut: 'TERMINEE',
      utilisateurIdCloture,
      estPayee: true // Payée via abonnement
    }, { transaction });
    
    // Libérer le poste
    await session.poste.update(
      { statut: 'LIBRE' },
      { transaction }
    );
    
    await transaction.commit();
    
    return await Session.findByPk(sessionId, {
      include: [
        { model: Poste, as: 'poste', include: [{ model: TypePoste, as: 'typePoste' }] },
        { model: Client, as: 'client' },
        { model: User, as: 'utilisateurDemarrage' },
        { model: User, as: 'utilisateurCloture' },
        { model: Abonnement, as: 'abonnement' }
      ]
    });
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### 3. 🎯 Amélioration SessionController.js
```javascript
/**
 * 🎯 NOUVEAU: Démarrer une session avec abonnement
 * POST /api/sessions/demarrer-avec-abonnement
 */
async demarrerSessionAvecAbonnement(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw createError(ErrorTypes.VALIDATION.VALIDATION_ERROR, errors.array());
    }

    const { posteId, abonnementId, dureeEstimeeMinutes } = req.body;

    console.log('🎯 [SESSION] Démarrage avec abonnement:', {
      posteId,
      abonnementId,
      dureeEstimeeMinutes,
      utilisateur: req.user.username
    });

    const session = await SessionService.demarrerSessionAvecAbonnement(
      posteId,
      abonnementId,
      req.user.id,
      { dureeEstimeeMinutes }
    );

    return res.status(201).json({
      success: true,
      data: session,
      message: 'Session avec abonnement démarrée avec succès'
    });

  } catch (error) {
    console.error('❌ [SESSION] Erreur démarrage avec abonnement:', error);
    next(error);
  }
}

/**
 * 🎯 NOUVEAU: Terminer une session avec abonnement
 * PATCH /api/sessions/:id/terminer-abonnement
 */
async terminerSessionAvecAbonnement(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      throw createError(ErrorTypes.VALIDATION.INVALID_FORMAT, 'ID de session invalide');
    }

    console.log('🏁 [SESSION] Terminaison avec abonnement:', {
      sessionId: id,
      utilisateur: req.user.username
    });

    const session = await SessionService.terminerSessionAvecAbonnement(
      parseInt(id),
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: session,
      message: 'Session avec abonnement terminée avec succès'
    });

  } catch (error) {
    console.error('❌ [SESSION] Erreur terminaison avec abonnement:', error);
    next(error);
  }
}
```

### 4. 🛤️ Nouvelles routes sessionRoutes.js
```javascript
// Démarrer session avec abonnement
router.post('/demarrer-avec-abonnement',
  hasPermission('SESSIONS_CREATE'),
  [
    body('posteId').isInt({ min: 1 }).withMessage('ID de poste requis.'),
    body('abonnementId').isInt({ min: 1 }).withMessage('ID abonnement requis.'),
    body('dureeEstimeeMinutes').optional().isInt({ min: 1 }).withMessage('Durée en minutes invalide.')
  ],
  logResourceActivity('SESSION'),
  SessionController.demarrerSessionAvecAbonnement
);

// Terminer session avec abonnement
router.patch('/:id/terminer-abonnement',
  hasPermission('SESSIONS_MANAGE'),
  [param('id').isInt({ min: 1 }).withMessage('ID session invalide.')],
  logResourceActivity('SESSION'),
  SessionController.terminerSessionAvecAbonnement
);
```

### 5. 📊 Amélioration des statistiques de postes
```javascript
// Dans SessionService.js
static async obtenirStatistiquesPosteAvecAbonnements(posteId, options = {}) {
  try {
    const { dateDebut, dateFin } = options;
    
    const whereClause = { posteId };
    if (dateDebut && dateFin) {
      whereClause.dateHeureDebut = {
        [Op.between]: [dateDebut, dateFin]
      };
    }

    const sessions = await Session.findAll({
      where: whereClause,
      include: [
        { model: Client, as: 'client' },
        { model: Abonnement, as: 'abonnement' },
        { model: TypePoste, as: 'typePoste' }
      ]
    });

    // Statistiques détaillées
    const stats = {
      totalSessions: sessions.length,
      sessionsPayantes: sessions.filter(s => s.typeSession !== 'ABONNEMENT').length,
      sessionsAbonnement: sessions.filter(s => s.typeSession === 'ABONNEMENT').length,
      tempsUtilisationTotal: sessions.reduce((sum, s) => sum + (s.dureeReelleMinutes || 0), 0),
      chiffreAffaireTotal: sessions
        .filter(s => s.typeSession !== 'ABONNEMENT')
        .reduce((sum, s) => sum + (parseFloat(s.montantTotal) || 0), 0),
      heuresAbonnementConsommees: sessions
        .filter(s => s.typeSession === 'ABONNEMENT')
        .reduce((sum, s) => sum + ((s.dureeReelleMinutes || 0) / 60), 0)
    };

    return stats;
    
  } catch (error) {
    console.error('❌ [SESSION] Erreur statistiques poste avec abonnements:', error);
    throw error;
  }
}
```

## Avantages de cette approche

### ✅ Séparation claire des responsabilités
- Sessions normales : gestion classique avec paiement
- Sessions abonnement : consommation d'heures pré-payées

### ✅ Traçabilité complète
- Toutes les sessions sont enregistrées
- Les statistiques distinguent sessions payantes vs abonnement
- Historique complet des consommations d'abonnement

### ✅ Gestion des erreurs robuste
- Vérifications de disponibilité avant création
- Gestion transactionnelle pour la cohérence des données
- Messages d'erreur explicites

### ✅ Flexibilité
- Peut être étendu pour d'autres types de sessions
- Compatible avec l'architecture existante
- Prêt pour l'évolutivité SaaS

## Prochaines étapes

1. **Appliquer ces corrections** dans votre backend
2. **Tester** les nouvelles fonctionnalités
3. **Adapter le frontend** pour gérer les sessions avec abonnement
4. **Mettre à jour** la documentation API

Cette approche respecte vos principes SOLID et maintient une architecture claire et maintenable.
