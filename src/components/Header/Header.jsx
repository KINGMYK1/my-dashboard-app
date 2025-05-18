import React, { useState } from 'react'; // Importez useState pour gérer l'état local du thème
import { Bell, Search, Sun, Moon, Globe } from 'lucide-react'; // Importez Sun et Moon pour les icônes de thème, Globe pour la langue
import { useLanguage } from '../../contexts/LanguageContext'; // Importez le hook de langue si déjà mis en place

// Composant Header
const Header = () => {
  const userName = "Jean Dupont"; // À remplacer par les données de l'utilisateur réel
  const initials = userName.split(' ').map(name => name[0]).join('');

  // MODIFICATION : État local pour gérer le thème (clair ou sombre)
  // C'est une gestion simple pour le template. Dans une vraie application,
  // vous utiliseriez probablement un Contexte ou un état global.
  const [theme, setTheme] = useState('light'); // 'light' ou 'dark'

  // Si vous avez déjà mis en place le contexte de langue, utilisez le hook
  const { language, changeLanguage, translations, loading } = useLanguage();

  // MODIFICATION : Fonction pour basculer le thème
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // Cette ligne bascule la classe 'dark' sur l'élément html.
    // Tailwind, configuré avec darkMode: 'class', réagira à cette classe.
    document.documentElement.classList.toggle('dark');
  };

  // Si vous avez déjà mis en place le sélecteur de langue, gardez cette logique
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const toggleLanguageMenu = () => { setIsLanguageMenuOpen(!isLanguageMenuOpen); };
  const selectLanguage = (lang) => { changeLanguage(lang); setIsLanguageMenuOpen(false); };


  return (
    // MODIFICATION : Classes Tailwind pour le thème sombre sur le header
    // Utilise bg-gray-900 pour le fond sombre, text-white pour le texte clair, shadow-lg pour l'ombre.
    // La bordure bleue a été supprimée.
    <header className="bg-gray-900 text-white shadow-lg h-16 max-h-[10vh] flex items-center justify-between px-4 z-10"> {/* Supprimé border-b border-blue-700 */}
      {/* Logo et nom de société */}
      <div className="flex items-center">
        {/* Placeholder pour le logo avec un style gaming */}
        <div className="bg-blue-600 rounded-lg w-10 h-10 flex items-center justify-center text-white font-bold text-xl mr-3 shadow-blue-500/50 shadow-lg">
          G
        </div>
        {/* Nom de société avec un style gaming */}
        <span className="text-2xl font-bold text-blue-400 tracking-wide">Gaming<span className="text-gray-200">Hub</span></span>
      </div>

      {/* Zone centrale de recherche (cachée sur mobile) */}
      <div className="hidden md:flex items-center relative">
        <Search className="absolute left-3 text-gray-400" size={18} />
        {/* MODIFICATION : Style de la barre de recherche pour le thème sombre */}
        {/* bg-gray-800 et border-gray-700 pour le fond et la bordure sombres, text-gray-200 pour le texte clair */}
        <input
          type="text"
          // Utilisation de la traduction pour le placeholder si le contexte de langue est présent
          placeholder={translations?.search || 'Rechercher...'} // Utilisez translations?.search pour éviter une erreur si translations n'est pas encore chargé
          className="pl-10 pr-4 py-2 rounded-full bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 border border-gray-700"
        />
      </div>

      {/* Profil, notifications, thème et langue */}
      <div className="flex items-center space-x-4">
         {/* MODIFICATION : Bouton pour basculer le thème */}
         {/* Affiche l'icône Lune en mode clair (pour passer au sombre) et Soleil en mode sombre (pour passer au clair) */}
         <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none transition-colors duration-200"
            // Utilisation des traductions pour le titre du bouton si le contexte de langue est présent
            title={theme === 'light' ? (translations?.switchToDarkMode || 'Switch to dark mode') : (translations?.switchToLightMode || 'Switch to light mode')}
         >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
         </button>

         {/* Sélecteur de langue (si déjà mis en place) */}
         <div className="relative">
            <button
                onClick={toggleLanguageMenu}
                className="p-2 rounded-full hover:bg-gray-700 focus:outline-none transition-colors duration-200 flex items-center"
            >
                <Globe size={20} className="text-gray-300 mr-1" />
                <span className="text-sm text-gray-300">{language?.toUpperCase() || 'FR'}</span> {/* Utilisez language?.toUpperCase() */}
            </button>
            {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-24 bg-gray-800 rounded-md shadow-lg z-20 overflow-hidden">
                    <button onClick={() => selectLanguage('fr')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"> Français </button>
                    <button onClick={() => selectLanguage('en')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"> English </button>
                     <button onClick={() => selectLanguage('ar')} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"> العربية </button>
                </div>
            )}
         </div>


        {/* Bouton de notification */}
        {/* MODIFICATION : Style du bouton de notification pour le thème sombre */}
        <button className="relative p-2 rounded-full hover:bg-gray-700 focus:outline-none transition-colors duration-200">
          <Bell size={20} className="text-gray-300" /> {/* Utilise text-gray-300 pour l'icône */}
          {/* Indicateur de nouvelle notification (exemple) */}
          <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
        </button>

        {/* Bulle de profil utilisateur */}
        <div className="flex items-center">
           {/* MODIFICATION : Style de la bulle de profil pour le thème sombre */}
           {/* bg-blue-600 reste pour la couleur d'accent, shadow-md pour l'ombre */}
          <div className="bg-blue-600 rounded-full w-9 h-9 flex items-center justify-center text-white font-semibold text-lg shadow-blue-500/50 shadow-md">
            {initials}
          </div>
          {/* Optionnel: Afficher le nom de l'utilisateur sur les écrans plus larges */}
          <span className="ml-2 text-gray-300 hidden sm:inline">{userName}</span> {/* Utilise text-gray-300 */}
        </div>
      </div>
    </header>
  );
};

export default Header;
