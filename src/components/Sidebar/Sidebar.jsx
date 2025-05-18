import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Importez Link
// Importez les icônes nécessaires, y compris Pin et les nouvelles icônes de panneau
import { Home, Users, Settings, LogOut, Pin, PanelLeftClose, PanelRightOpen } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext'; // MODIFICATION : Import du hook de langue

// Composant Sidebar
const Sidebar = ({ expanded, toggleSidebar, isMobile }) => {
  // État pour gérer si la souris survole l'ensemble du sidebar (sur desktop, quand non étendu)
  const [isHovered, setIsHovered] = useState(false);

  // MODIFICATION : Utilisation du hook de langue
  const { translations } = useLanguage();

  // Liste des éléments du menu du sidebar avec leurs chemins
  // MODIFICATION : Utilisation des traductions pour les labels
  const menuItems = [
    { icon: <Home size={20} />, label: translations.home, path: '/' },
    { icon: <Users size={20} />, label: translations.users, path: '/users' },
    { icon: <Settings size={20} />, label: translations.settings, path: '/settings' },
  ];

  // Détermine si le sidebar doit être étendu visuellement.
  // Il est étendu si 'expanded' est vrai (bouton cliqué)
  // OU si ce n'est pas un appareil mobile ET qu'il est survolé (isHovered).
  const shouldExpandVisual = expanded || (!isMobile && isHovered);

  // Détermine l'icône du bouton de bascule en fonction de l'état
  const renderToggleButtonIcon = () => {
    if (isMobile) {
      // Sur mobile : PanelLeftClose si étendu (pour fermer), PanelRightOpen si rétracté (pour ouvrir)
      return expanded ? <PanelLeftClose size={20} /> : <PanelRightOpen size={20} />;
    } else {
      // Sur desktop
      if (expanded) {
        // Si étendu (fixé) : PanelLeftClose (pour rétracter)
        return <PanelLeftClose size={20} />;
      } else {
        // Si rétracté : PanelRightOpen (pour étendre)
        return <PanelRightOpen size={20} />;
      }
    }
  };

  // Détermine l'icône de "fixation" (Pin) à afficher à côté du bouton de bascule sur desktop étendu
  const renderPinIcon = () => {
    // Affiche l'icône Pin uniquement sur desktop lorsque le sidebar est expanded (fixé)
    if (!isMobile && expanded) {
      return <Pin size={20} className="ml-1 text-gray-400" />; // Ajout de marge et couleur pour distinction
    }
    return null;
  };


  return (
    <aside
      className={`
        bg-gray-900 text-white
        transition-all duration-300 ease-in-out
        ${shouldExpandVisual ? 'w-60' : 'w-16'}
        ${isMobile ?
          (expanded ? 'fixed inset-y-0 left-0 w-60' : 'hidden') // Mobile: fixe, prend toute la hauteur, caché si non étendu
          : 'relative h-full' // Desktop: relatif, prend toute la hauteur, géré par la grille parente
        }
        z-30  // S'assure que le sidebar est au-dessus du contenu principal sur mobile
        flex flex-col // Utilise flexbox pour positionner les éléments internes
        overflow-y-auto // Permet le défilement vertical si le contenu dépasse
        overflow-x-hidden // Empêche le défilement horizontal
      `}
      // Ajout des écouteurs de survol à l'aside
      // Ils n'affectent l'état isHovered que si le sidebar n'est pas déjà expanded
      onMouseEnter={() => !isMobile && !expanded && setIsHovered(true)}
      onMouseLeave={() => !isMobile && !expanded && setIsHovered(false)}
    >
      {/* Bouton pour basculer le sidebar */}
      {/* Le bouton est toujours visible sur desktop, conditionnel sur mobile */}
      {(!isMobile || (isMobile && expanded)) && (
        // Le conteneur du bouton est centré si le sidebar n'est PAS visuellement étendu
        <div className={`flex ${shouldExpandVisual ? 'justify-end' : 'justify-center'} p-2'}`}>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-gray-700 focus:outline-none flex items-center" // Ajout flex items-center pour aligner icône/pin
          >
            {/* Rend l'icône de bascule */}
            {renderToggleButtonIcon()}
             {/* Affiche l'icône Pin si nécessaire */}
            {renderPinIcon()}
          </button>
        </div>
      )}


      {/* Menu items */}
      <nav className="mt-6 flex-1"> {/* flex-1 permet à la nav de prendre l'espace restant */}
        <ul className="space-y-2 px-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              {/* Utilisez le composant Link de react-router-dom */}
              <Link
                to={item.path} // Le chemin de la route
                className={`
                  flex items-center py-2 px-3 rounded-lg
                  ${window.location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-gray-800'} {/* Exemple pour marquer l'élément actif */}
                  transition-colors duration-200
                  ${!shouldExpandVisual && 'justify-center'} // Centre l'icône si le sidebar est rétracté visuellement
                `}
                title={!shouldExpandVisual ? item.label : ''} // Ajoute un tooltip si rétracté visuellement
                // Sur mobile, fermez le sidebar après avoir cliqué sur un lien
                onClick={isMobile && expanded ? toggleSidebar : undefined}
              >
                <span className="text-lg">{item.icon}</span>
                {/* Affiche le label uniquement si le sidebar est étendu visuellement */}
                {shouldExpandVisual && <span className="ml-4">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section (Déconnexion) */}
      {/* Centre le bouton si rétracté visuellement */}
      <div className={`p-4 ${!shouldExpandVisual && 'flex justify-center'}`}>
        {/* Pour la déconnexion, vous utiliseriez probablement une fonction de gestion d'état ou de contexte */}
        <button
          className={`
            flex items-center py-2 px-3 w-full rounded-lg
            text-red-300 hover:bg-red-800 hover:bg-opacity-30
            transition-colors duration-300 // Durée de transition ajustée
            ${!shouldExpandVisual && 'justify-center w-auto'} // Centre et ajuste la largeur si rétracté visuellement
          `}
          // MODIFICATION : Utilisation de la traduction pour le titre
          title={!shouldExpandVisual ? translations.logout : ''} // Ajoute un tooltip si rétracté visuellement
        >
          <LogOut size={20} />
          {/* MODIFICATION : Affiche le label uniquement si le sidebar est étendu visuellement */}
          {shouldExpandVisual && <span className="ml-4">{translations.logout}</span>}
        </button>
      </div>

       {/* Overlay sombre pour mobile lorsque le sidebar est ouvert */}
       {isMobile && expanded && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={toggleSidebar} // Ferme le sidebar en cliquant sur l'overlay
          ></div>
        )}
    </aside>
  );
};

export default Sidebar;
