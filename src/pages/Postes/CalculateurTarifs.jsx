import React, { useState, useMemo } from 'react';
import { X, Calculator, TrendingUp, Clock, Euro } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTypesPostes, useSimulerTarifs } from '../../hooks/useTypePostes';
import TarifService from '../../services/tarifService';
import { Card, Button } from '../../components/ui'; // ✅ Correction de l'import

const CalculateurTarifs = ({ onClose }) => {
  const { translations } = useLanguage();
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const [selectedTypePoste, setSelectedTypePoste] = useState('');
  const [dureeHeures, setDureeHeures] = useState(1);
  const [dureeMinutes, setDureeMinutes] = useState(0);
  const [tauxReduction, setTauxReduction] = useState(0);
  const [appliquerPromo, setAppliquerPromo] = useState(false);
  const [modeComparaison, setModeComparaison] = useState(false);

  const { data: typesPostes = [], isLoading } = useTypesPostes();
  
  // Calcul de la durée totale en minutes
  const dureeTotaleMinutes = useMemo(() => {
    return dureeHeures * 60 + dureeMinutes;
  }, [dureeHeures, dureeMinutes]);

  // Type de poste sélectionné
  const typePosteSelectionne = useMemo(() => {
    return typesPostes.find(t => t.id === parseInt(selectedTypePoste));
  }, [typesPostes, selectedTypePoste]);

  // Calcul principal
  const calculPrincipal = useMemo(() => {
    if (!typePosteSelectionne || dureeTotaleMinutes <= 0) return null;
    
    try {
      return TarifService.calculerPrixSession(typePosteSelectionne, dureeTotaleMinutes, {
        appliquerPromo,
        tauxReduction
      });
    } catch (error) {
      console.error('❌ [CALCUL_PRINCIPAL] Erreur:', error);
      return null;
    }
  }, [typePosteSelectionne, dureeTotaleMinutes, appliquerPromo, tauxReduction]);

  // Meilleur plan disponible
  const meilleurPlan = useMemo(() => {
    if (!typePosteSelectionne || dureeTotaleMinutes <= 0) return null;
    
    try {
      return TarifService.obtenirMeilleurPlan(typePosteSelectionne, dureeTotaleMinutes);
    } catch (error) {
      console.error('❌ [MEILLEUR_PLAN] Erreur:', error);
      return null;
    }
  }, [typePosteSelectionne, dureeTotaleMinutes]);

  // Simulation de tous les scénarios
  const scenarios = useSimulerTarifs(
    selectedTypePoste ? parseInt(selectedTypePoste) : null, 
    dureeTotaleMinutes
  );

  // Styles dynamiques optimisés
  const styles = useMemo(() => ({
    container: `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`,
    modal: `${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`,
    card: `${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`,
    input: `w-full px-3 py-2 border rounded-md transition-colors ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`
  }), [isDarkMode]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.modal}>
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4">Chargement des types de postes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Calculator className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold">
              {translations?.calculateurTarifs || 'Calculateur de Tarifs'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Contenu principal */}
        <div className="p-6 space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sélection du type de poste */}
            <div className={styles.card}>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Type de poste
                  </label>
                  <select
                    value={selectedTypePoste}
                    onChange={(e) => setSelectedTypePoste(e.target.value)}
                    className={styles.input}
                  >
                    <option value="">Sélectionner un type de poste</option>
                    {typesPostes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.nom} ({type.tarifHoraireFormate || TarifService.formaterPrix(type.tarifHoraireBase, type.devise)}/h)
                        {type.nombrePlansActifs > 0 && ` - ${type.nombrePlansActifs} plans`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Heures
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={dureeHeures}
                      onChange={(e) => setDureeHeures(parseInt(e.target.value) || 0)}
                      className={styles.input}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Minutes
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={dureeMinutes}
                      onChange={(e) => setDureeMinutes(parseInt(e.target.value) || 0)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={appliquerPromo}
                      onChange={(e) => setAppliquerPromo(e.target.checked)}
                      className="mr-2 text-purple-500"
                    />
                    Appliquer une réduction
                  </label>
                  {appliquerPromo && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={tauxReduction}
                        onChange={(e) => setTauxReduction(parseFloat(e.target.value) || 0)}
                        className={`${styles.input} w-20`}
                      />
                      <span>%</span>
                    </div>
                  )}
                </div>

                {/* ✅ Affichage d'infos supplémentaires sur le type sélectionné */}
                {typePosteSelectionne && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <div className="font-medium">📊 Informations du type:</div>
                      <div>• Plans actifs: {typePosteSelectionne.nombrePlansActifs}</div>
                      {typePosteSelectionne.prixMinimum !== typePosteSelectionne.prixMaximum && (
                        <div>• Gamme de prix: {TarifService.formaterPrix(typePosteSelectionne.prixMinimum, typePosteSelectionne.devise)} - {TarifService.formaterPrix(typePosteSelectionne.prixMaximum, typePosteSelectionne.devise)}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Résultat principal */}
            {calculPrincipal && (
              <div className={styles.card}>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Euro className="w-5 h-5 mr-2 text-green-500" />
                  Résultat du Calcul
                </h3>
                
                <div className="space-y-3">
                  <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-white">
                    <div className="text-3xl font-bold">
                      {TarifService.formaterPrix(calculPrincipal.prix, calculPrincipal.devise)}
                    </div>
                    <div className="text-sm opacity-90">
                      pour {TarifService.formaterDuree(dureeTotaleMinutes)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type de tarif:</span>
                      <div className="font-medium">{calculPrincipal.typeTarif}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Durée facturée:</span>
                      <div className="font-medium">
                        {TarifService.formaterDuree(calculPrincipal.dureeFacturee)}
                      </div>
                    </div>
                  </div>

                  {calculPrincipal.economie > 0 && (
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      <div className="text-green-800 dark:text-green-200 text-sm">
                        💰 Économie: {TarifService.formaterPrix(calculPrincipal.economie, calculPrincipal.devise)}
                      </div>
                    </div>
                  )}

                  {calculPrincipal.planUtilise && (
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-purple-800 dark:text-purple-200 text-sm">
                        📦 Plan utilisé: {calculPrincipal.planUtilise.nom}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Comparaison des scénarios */}
          {scenarios.length > 0 && (
            <div className={styles.card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Comparaison des Options ({scenarios.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModeComparaison(!modeComparaison)}
                >
                  {modeComparaison ? 'Vue Simple' : 'Vue Détaillée'}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scenarios.map((scenario, index) => (
                  <div
                    key={index}
                    className={`
                      p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md
                      ${index === 0 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium truncate" title={scenario.nom || scenario.type}>
                        {scenario.nom || scenario.type}
                      </span>
                      {index === 0 && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded flex-shrink-0">
                          OPTIMAL
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {TarifService.formaterPrix(scenario.prix, scenario.devise)}
                    </div>
                    
                    {modeComparaison && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>Durée: {TarifService.formaterDuree(scenario.dureeFacturee)}</div>
                        {scenario.planUtilise && (
                          <div>Plan: {scenario.planUtilise.nom}</div>
                        )}
                        {scenario.economie > 0 && (
                          <div className="text-green-600 dark:text-green-400">
                            Économie: {TarifService.formaterPrix(scenario.economie, scenario.devise)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* ✅ Recommandation automatique */}
              {scenarios.length > 1 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-yellow-800 dark:text-yellow-200 text-sm">
                    💡 <strong>Recommandation:</strong> L'option "{scenarios[0]?.nom || scenarios[0]?.type}" est la plus avantageuse pour cette durée.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ✅ Message si aucun résultat */}
          {selectedTypePoste && dureeTotaleMinutes > 0 && !calculPrincipal && scenarios.length === 0 && (
            <div className={styles.card}>
              <div className="text-center py-8 text-gray-500">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Impossible de calculer le tarif pour ces paramètres</p>
                <p className="text-sm mt-2">Vérifiez la configuration du type de poste</p>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalculateurTarifs;