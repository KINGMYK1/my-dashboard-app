import React from 'react';
import { X, CreditCard, User, Calendar, MapPin, FileText, History } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Portal from '../Portal/Portal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

const TransactionDetailsModal = ({ 
  isOpen, 
  onClose, 
  transaction, 
  formatCurrency, 
  formatDate 
}) => {
  const { effectiveTheme } = useTheme();
  const { translations } = useLanguage();
  const isDarkMode = effectiveTheme === 'dark';

  if (!isOpen || !transaction) return null;

  // Styles
  const bgColor = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  const getStatutBadge = (statut) => {
    const variants = {
      'EN_ATTENTE': { variant: 'yellow', label: 'En attente' },
      'PARTIELLEMENT_PAYEE': { variant: 'orange', label: 'Partiellement payée' },
      'VALIDEE': { variant: 'green', label: 'Validée' },
      'ANNULEE': { variant: 'red', label: 'Annulée' },
      'REMBOURSEE': { variant: 'purple', label: 'Remboursée' }
    };

    const config = variants[statut] || variants['EN_ATTENTE'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto ${bgColor}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={`${textPrimary} flex items-center gap-2`}>
              <CreditCard size={20} />
              Détails de la transaction {transaction.numeroTransaction}
            </CardTitle>
            <button
              onClick={onClose}
              className={`${textSecondary} hover:${textPrimary}`}
            >
              <X size={20} />
            </button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className={textSecondary}>Numéro:</span>
                    <span className={`font-medium ${textPrimary}`}>
                      {transaction.numeroTransaction}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={textSecondary}>Statut:</span>
                    {getStatutBadge(transaction.statutTransaction)}
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={textSecondary}>Type:</span>
                    <span className={textPrimary}>{transaction.typeTransaction}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={textSecondary}>Date:</span>
                    <span className={textPrimary}>{formatDate(transaction.dateTransaction)}</span>
                  </div>
                  
                  {transaction.datePaiementComplet && (
                    <div className="flex justify-between">
                      <span className={textSecondary}>Payé le:</span>
                      <span className={textPrimary}>{formatDate(transaction.datePaiementComplet)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Montants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className={textSecondary}>Montant HT:</span>
                    <span className={textPrimary}>{formatCurrency(transaction.montantHT)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={textSecondary}>Montant TTC:</span>
                    <span className={`font-medium ${textPrimary}`}>
                      {formatCurrency(transaction.montantTTC)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={textSecondary}>Montant payé:</span>
                    <span className={`font-medium ${textPrimary}`}>
                      {formatCurrency(transaction.montantPaye)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className={textSecondary}>Reste à payer:</span>
                    <span className={`font-medium ${transaction.resteAPayer > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                      {formatCurrency(transaction.resteAPayer)}
                    </span>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={textSecondary}>Progression du paiement</span>
                      <span className={textPrimary}>
                        {transaction.montantTTC > 0 
                          ? `${((transaction.montantPaye / transaction.montantTTC) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          transaction.resteAPayer <= 0 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ 
                          width: `${transaction.montantTTC > 0 
                            ? Math.min(100, (transaction.montantPaye / transaction.montantTTC) * 100)
                            : 0
                          }%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Informations de paiement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard size={18} />
                  Paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className={`block text-sm ${textSecondary}`}>Mode de paiement:</span>
                    <span className={`font-medium ${textPrimary}`}>
                      {transaction.modePaiement || 'Non spécifié'}
                    </span>
                  </div>
                  
                  {transaction.derniersChiffresCarte && (
                    <div>
                      <span className={`block text-sm ${textSecondary}`}>Derniers chiffres:</span>
                      <span className={`font-medium ${textPrimary}`}>
                        •••• {transaction.derniersChiffresCarte}
                      </span>
                    </div>
                  )}
                  
                  {transaction.typeCarte && (
                    <div>
                      <span className={`block text-sm ${textSecondary}`}>Type de carte:</span>
                      <span className={`font-medium ${textPrimary}`}>
                        {transaction.typeCarte}
                      </span>
                    </div>
                  )}
                </div>
                
                {transaction.notesPaiement && (
                  <div>
                    <span className={`block text-sm ${textSecondary} mb-1`}>Notes de paiement:</span>
                    <p className={`${textPrimary} text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded`}>
                      {transaction.notesPaiement}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client associé */}
            {transaction.client && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User size={18} />
                    Client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className={`block text-sm ${textSecondary}`}>Nom complet:</span>
                      <span className={`font-medium ${textPrimary}`}>
                        {transaction.client.prenom} {transaction.client.nom}
                      </span>
                    </div>
                    
                    {transaction.client.telephone && (
                      <div>
                        <span className={`block text-sm ${textSecondary}`}>Téléphone:</span>
                        <span className={textPrimary}>{transaction.client.telephone}</span>
                      </div>
                    )}
                    
                    {transaction.client.email && (
                      <div>
                        <span className={`block text-sm ${textSecondary}`}>Email:</span>
                        <span className={textPrimary}>{transaction.client.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Session associée */}
            {transaction.session && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin size={18} />
                    Session associée
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className={`block text-sm ${textSecondary}`}>Poste:</span>
                      <span className={`font-medium ${textPrimary}`}>
                        {transaction.session.poste?.nom || 'Non spécifié'}
                      </span>
                    </div>
                    
                    <div>
                      <span className={`block text-sm ${textSecondary}`}>Durée:</span>
                      <span className={textPrimary}>
                        {transaction.session.dureeEffectiveMinutes} minutes
                      </span>
                    </div>
                    
                    <div>
                      <span className={`block text-sm ${textSecondary}`}>Coût calculé:</span>
                      <span className={textPrimary}>
                        {formatCurrency(transaction.session.coutCalculeFinal)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historique des paiements partiels */}
            {transaction.detailsPaiementsPartiels && transaction.detailsPaiementsPartiels.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History size={18} />
                    Historique des paiements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transaction.detailsPaiementsPartiels.map((paiement, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <div>
                          <div className={`font-medium ${textPrimary}`}>
                            {formatCurrency(paiement.montant)}
                          </div>
                          <div className={`text-sm ${textSecondary}`}>
                            {formatDate(paiement.date)} • {paiement.modePaiement}
                          </div>
                          {paiement.notes && (
                            <div className={`text-sm ${textSecondary} italic`}>
                              {paiement.notes}
                            </div>
                          )}
                        </div>
                        
                        {paiement.derniersChiffresCarte && (
                          <div className={`text-sm ${textSecondary}`}>
                            •••• {paiement.derniersChiffresCarte}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historique des statuts */}
            {transaction.historiqueStatuts && transaction.historiqueStatuts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText size={18} />
                    Historique des statuts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transaction.historiqueStatuts.map((changement, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <div>
                          <div className={`font-medium ${textPrimary}`}>
                            {changement.ancienStatut && `${changement.ancienStatut} → `}
                            {changement.nouveauStatut || changement.statut}
                          </div>
                          <div className={`text-sm ${textSecondary}`}>
                            {formatDate(changement.date)}
                          </div>
                          {changement.commentaire && (
                            <div className={`text-sm ${textSecondary} italic`}>
                              {changement.commentaire}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end">
              <Button onClick={onClose}>
                Fermer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Portal>
  );
};

export default TransactionDetailsModal;