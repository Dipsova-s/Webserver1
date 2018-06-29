using EveryAngle.Shared.Globalization;
using EveryAngle.Shared.Globalization.Helpers;
using System.Globalization;
using System.Linq;

namespace EveryAngle.ManagementConsole.Localization
{
    public static class UserCulture
    {
        // language use in MC
        const string UI_LANGUAGE = "en";

        public static string GetScriptCulture()
        {
            return "~/Scripts/KendoUI/Cultures/kendo.culture." + GetCultureLetter() + ".min.js";
        }

        public static string GetCultureLetter()
        {
            return GetCultureLetter(CultureInfo.CurrentCulture.TwoLetterISOLanguageName);
        }

        public static string GetCultureLetter(string letterName)
        {
            string letter = "en";
            if (letterName == "th" || letterName == "en" || 
                letterName == "da" || letterName == "fr" || 
                letterName == "de" || letterName == "nl")
            {
                letter = letterName;
            }
            return letter;
        }

        public static string GetLocalization()
        {
            return ResourceHelper.ToJson(typeof(Resource), new CultureInfo(UI_LANGUAGE));
        }

        public static string GetCaption()
        {
            return ResourceHelper.ToJson(typeof(Captions), new CultureInfo(UI_LANGUAGE));
        }
    }
}
