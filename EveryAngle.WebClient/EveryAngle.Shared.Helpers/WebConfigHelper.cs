using System;
using System.Linq;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Reflection;
using System.Web.Configuration;
using System.Web;
using System.Xml;

namespace EveryAngle.Shared.Helpers
{
    public static class WebConfigHelper
    {
        const string strOverrideFileName = "Web.config";

        public static string[] WebClientSearchPatterns => GetAppSettingByKey("WCLogFilePatterns").Split('|');
        public static string[] ManagementConsoleSearchPatterns => GetAppSettingByKey("MCLogFilePatterns").Split('|');

        public static XmlDocument LoadConfigDocument(string filePath)
        {
            XmlDocument doc = null;
            try
            {
                doc = new XmlDocument();
                doc.Load(filePath);
                return doc;
            }
            catch (System.IO.FileNotFoundException e)
            {
                throw new Exception("No configuration file found.", e);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static void EditAppSettings(string key, string value)
        {
            Configuration webConfigFile = System.Web.Configuration.WebConfigurationManager.OpenWebConfiguration("~");
            AppSettingsSection appsettings = (AppSettingsSection)webConfigFile.GetSection("appSettings");

            if (appsettings != null)
            {
                appsettings.Settings[key].Value = value;
                webConfigFile.Save();
            }
        }

        public static string GetAppSettingByKey(string key, HttpContext context = null)
        {
            HttpContext currentContext = context ?? HttpContext.Current;
            string settingValue = null;
            if (currentContext != null)
            {
                string overRideConfigFile = Path.Combine(currentContext.Request.PhysicalApplicationPath, strOverrideFileName);
                if (File.Exists(overRideConfigFile))
                {
                    XmlDocument xmlDocument = LoadConfigDocument(overRideConfigFile);
                    string keyValue = GetAppSettingFromConfigXmlNodeBy(xmlDocument, key);
                    if (!string.IsNullOrEmpty(keyValue))
                    {
                        return keyValue;
                    }
                }
                settingValue = ConfigurationManager.AppSettings[key];
            }
            return settingValue;
        }

        public static string GetNoneExecutingWebConfigBy(string keyName)
        {
            string webConfigFilePath = WebConfigHelper.GetWebClientFilePathBy("web.config");
            XmlDocument xmlDocument = LoadConfigDocument(webConfigFilePath);
            string keyValue = GetAppSettingFromConfigXmlNodeBy(xmlDocument, keyName);
            return keyValue;
        }

        public static string GetOverRideWebConfigBy(string keyName)
        {
            string webConfigFilePath = WebConfigHelper.GetWebClientFilePathBy(strOverrideFileName);
            XmlDocument xmlDocument = LoadConfigDocument(webConfigFilePath);
            string keyValue = GetAppSettingFromConfigXmlNodeBy(xmlDocument, keyName);
            return keyValue;
        }

        public static XmlNode GetOverRideWebConfig()
        {
            string overideFilePath = WebConfigHelper.GetWebClientFilePathBy(strOverrideFileName);
            XmlDocument xmlDocument = LoadConfigDocument(overideFilePath);
            XmlNode nodelist = xmlDocument.SelectSingleNode("configuration/appSettings");
            return nodelist;
        }

        public static string GetAppSettingFromConfigXmlNodeBy(XmlDocument xmlDocument, string keyName)
        {
            XmlNode nodelist = xmlDocument.SelectSingleNode("//appSettings");
            string keyValue = string.Empty;
            foreach (XmlNode xnn in nodelist)
            {
                if (xnn.Attributes != null && xnn.Attributes[0].Value.ToLower() == keyName.ToLowerInvariant())
                { 
                        keyValue = xnn.Attributes[1].Value; 
                        break;
                }
            }
            return keyValue;
        }

        public static bool IsUseOverrideBy(string keyName)
        {
            return (GetOverRideWebConfigBy(keyName) != string.Empty);
        }

        static public string GetWebClientFilePathBy(string fileName)
        {
            return UtilitiesHelper.GetWebClientPath(fileName);
        }

        public static string GetAppSettingsValueFromWebConfig(string overideFilePath, string key)
        {
            XmlDocument xmlDocument = WebConfigHelper.LoadConfigDocument(overideFilePath);

            string webConfigKeys = "";


            foreach (XmlNode node in xmlDocument.DocumentElement.SelectSingleNode("appSettings").ChildNodes)
            {
                if ((node.Name == "add") && (node.Attributes[0].Value.Equals(key)))
                {
                    webConfigKeys = node.Attributes[1].Value;
                    break;
                }
            }

            return webConfigKeys;
        }

        public static void UpdateAppSettingsValueToWebConfig(ref XmlDocument xmlDocument, string key, string value)
        {
            foreach (XmlNode node in xmlDocument.DocumentElement.SelectSingleNode("appSettings").ChildNodes)
            {
                if ((node.Name == "add") && (node.Attributes[0].Value.Equals(key)))
                {
                    node.Attributes[1].Value = value;
                    break;
                }
            }
        }
    }
}
