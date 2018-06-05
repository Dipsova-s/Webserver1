using EveryAngle.OData.DTO.Settings;
using EveryAngle.OData.ViewModel.Settings;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.Reflection;
using System.Text.RegularExpressions;

namespace EveryAngle.OData.Settings
{
    public static class ODataSettings
    {
        private static string _configFile;
        private static string _filePath;

        private static ODataSettingsViewModel _settingsViewModel;
        public static ODataSettingsViewModel ViewModel
        {
            get { return _settingsViewModel; }
        }

        private static SettingsDTO _settings;
        public static SettingsDTO Settings
        {
            get { return _settings; }
        }

        static ODataSettings()
        {
            _configFile = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().GetName().CodeBase), "settings.json").Substring(6);
            if (!File.Exists(_configFile))
                CreateJSONSettingFile();

            if (File.Exists(_configFile))
            {
                Initialize(_configFile);
            }
            else
            {
                // check point, if file still doesn't exist throw out..
                throw new ApplicationException("Config not found at " + _configFile);
            }
        }

        public static void Update(dynamic newSettings)
        {
            if (newSettings.angles_query != null)
                _settingsViewModel.angles_query = newSettings.angles_query;
            if (newSettings.host != null)
                _settingsViewModel.host = newSettings.host;
            if (newSettings.max_angles != null)
                _settingsViewModel.max_angles = newSettings.max_angles;
            if (newSettings.metadata_resync_minutes != null)
                _settingsViewModel.metadata_resync_minutes = newSettings.metadata_resync_minutes;
            if (newSettings.model_id != null)
                _settingsViewModel.model_id = newSettings.model_id;
            if (newSettings.page_size != null)
                _settingsViewModel.page_size = newSettings.page_size;
            if (newSettings.password != null)
                _settingsViewModel.password = newSettings.password;
            if (newSettings.timeout != null)
                _settingsViewModel.timeout = newSettings.timeout;
            if (newSettings.user != null)
                _settingsViewModel.user = newSettings.user;
            if (newSettings.web_client_uri != null)
                _settingsViewModel.web_client_uri = newSettings.web_client_uri;

            CreateJSONSettingFile(_settingsViewModel);
        }        

        public static void Initialize(string file)
        {
            _filePath = file;

            // read JSON directly from a file
            using (StreamReader streamReader = new StreamReader(_filePath))
            {
                string json = streamReader.ReadToEnd();
                _settingsViewModel = JsonConvert.DeserializeObject<ODataSettingsViewModel>(json);
                _settings = _settingsViewModel.Convert();
            }
        }

        /// <summary>
        /// create with a default value
        /// </summary>
        private static void CreateJSONSettingFile()
        {
            CreateJSONSettingFile(new ODataSettingsViewModel());
        }

        private static void CreateJSONSettingFile(ODataSettingsViewModel settings)
        {
            // write JSON directly to a file
            using (StreamWriter file = File.CreateText(_configFile))
            using (JsonTextWriter writer = new JsonTextWriter(file))
            {
                writer.Formatting = Formatting.Indented;
                JObject jObj = JObject.FromObject(settings);
                jObj.WriteTo(writer);
            }

            _settings = settings.Convert();
        }
    }
}