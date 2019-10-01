using EveryAngle.OData.DTO.Settings;
using EveryAngle.OData.ViewModel.Settings;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.Reflection;

namespace EveryAngle.OData.Settings
{
    public static class ODataSettings
    {
        private static string _configFile;
        public static ODataSettingsViewModel ViewModel { get; private set; }
        public static SettingsDTO Settings { get; private set; }

        static ODataSettings()
        {
            _configFile = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().GetName().CodeBase), "settings.json").Substring(6);
            if (!File.Exists(_configFile))
            {
                CreateJSONSettingFile(new ODataSettingsViewModel());
            }

            Initialize();
        }

        //This method cannot be covered 100% because from API can send only one field to update, so the branching will not work for this area
        public static void Update(dynamic newSettings)
        {
            if (newSettings.angles_query != null)
                ViewModel.angles_query = newSettings.angles_query;
            if (newSettings.host != null)
                ViewModel.host = newSettings.host;
            if (newSettings.max_angles != null)
                ViewModel.max_angles = newSettings.max_angles;
            if (newSettings.metadata_resync_minutes != null)
                ViewModel.metadata_resync_minutes = newSettings.metadata_resync_minutes;
            if (newSettings.model_id != null)
                ViewModel.model_id = newSettings.model_id;
            if (newSettings.page_size != null)
                ViewModel.page_size = newSettings.page_size;
            if (newSettings.password != null)
                ViewModel.password = newSettings.password;
            if (newSettings.timeout != null)
                ViewModel.timeout = newSettings.timeout;
            if (newSettings.user != null)
                ViewModel.user = newSettings.user;
            if (newSettings.web_client_uri != null)
                ViewModel.web_client_uri = newSettings.web_client_uri;
            if (newSettings.enable_compression != null)
                ViewModel.enable_compression = newSettings.enable_compression;

            CreateJSONSettingFile(ViewModel);
        }

        private static void Initialize()
        {
            // read JSON directly from a file
            using (StreamReader streamReader = new StreamReader(_configFile))
            {
                string json = streamReader.ReadToEnd();
                ViewModel = JsonConvert.DeserializeObject<ODataSettingsViewModel>(json);
                Settings = ViewModel.Convert();
            }
        }

        private static void CreateJSONSettingFile(ODataSettingsViewModel settings)
        {
            // write JSON directly to a file
            try
            {
                using (StreamWriter file = File.CreateText(_configFile))
                using (JsonTextWriter writer = new JsonTextWriter(file))
                {
                    writer.Formatting = Formatting.Indented;
                    JObject jObj = JObject.FromObject(settings);
                    jObj.WriteTo(writer);
                }
                Settings = settings.Convert();
            }
            catch (Exception ex)
            {
                throw new ApplicationException($"Config not found at {_configFile} {ex.Message}");
            }
        }
    }
}