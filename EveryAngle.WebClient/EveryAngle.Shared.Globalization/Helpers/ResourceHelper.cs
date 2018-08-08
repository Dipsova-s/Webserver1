using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Resources;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Shared.Globalization.Helpers
{
    public static class ResourceHelper
    {
        public static string ToJson(Type resource, CultureInfo culture)
        {
            ResourceManager rm = new ResourceManager(resource);
            PropertyInfo[] pis = resource.GetProperties(BindingFlags.Public | BindingFlags.Static);
            IEnumerable<KeyValuePair<string, string>> values =
                from pi in pis
                where pi.PropertyType == typeof(string)
                select new KeyValuePair<string, string>(
                    pi.Name,
                    rm.GetString(pi.Name, culture));
            Dictionary<string, string> dictionary = values.ToDictionary(k => k.Key, v => v.Value);

            return JsonConvert.SerializeObject(dictionary);
        }

        public static string GetCaption(string keyName, string cultureName)
        {
            CultureInfo culture = new CultureInfo(cultureName);
            return GetResourceText(typeof(Captions), keyName, culture);
        }
        public static string GetCaption(string keyName)
        {
            return GetCaption(keyName, CultureInfo.CurrentCulture.Name);
        }

        public static string GetLocalization(string keyName, string cultureName)
        {
            CultureInfo culture = new CultureInfo(cultureName);
            return GetResourceText(typeof(Resource), keyName, culture);
        }
        public static string GetLocalization(string keyName)
        {
            return GetLocalization(keyName, CultureInfo.CurrentCulture.Name);
        }

        private static string GetResourceText(Type resource, string keyName, CultureInfo culture)
        {
            ResourceManager resourceManager = new ResourceManager(resource);
            return resourceManager.GetString(keyName, culture);
        }
    }
}
