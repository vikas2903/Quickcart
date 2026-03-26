import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import es from "./es.json"; //spainsh   
import fr from "./fr.json"; //France/Canada
import de from "./de.json"; //Germany/Austria
import ptBR from "./pt-BR.json"; //Brazil/Portugal
import it from "./it.json"; //Italy
import ar from "./ar.json";  //Arabic
import sv from "./sv.json"; //Swedish

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        es: { translation: es },
        fr: { translation: fr },
        de: { translation: de },
        "pt-BR": { translation: ptBR },
        it: { translation: it },
        ar: { translation: ar },
        sv: { translation: sv }

    },
    lng: "en",
    fallbackLng: "en",
    defaultNS: "translation",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;