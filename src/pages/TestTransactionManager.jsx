import React, { useState } from 'react';
import SimpleEndSessionModal from '../components/Sessions/SimpleEndSessionModal';

const TestTransactionManager = () => {
  const [showModal, setShowModal] = useState(false);
  
  // Session d'exemple pour tester
  const sessionTest = {
    id: 'test-session-1',
    poste: { nom: 'Poste 1' },
    client: { nom: 'Client Test' },
    heureDebut: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2 heures
    typeSession: 'Payant',
    montantTotal: 50.00,
    montantPaye: 0,
    estPayee: false,
    transactions: [
      // Exemple de transaction existante
      // {
      //   id: 'trans-1',
      //   montant: 20.00,
      //   modePaiement: 'ESPECES',
      //   dateCreation: new Date().toISOString(),
      //   notes: 'Paiement partiel'
      // }
    ]
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test - Gestionnaire de Transactions</h1>
      
      <div className="space-y-4">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Ouvrir Modal de Fin de Session
        </button>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Session de test :</h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(sessionTest, null, 2)}
          </pre>
        </div>
      </div>

      <SimpleEndSessionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        session={sessionTest}
        onSessionEnded={() => {
          console.log('Session terminée !');
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default TestTransactionManager;
