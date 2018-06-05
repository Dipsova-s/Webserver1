using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;

namespace EveryAngle.OData.Utils
{
    public static class ODataSettings
    {
        private static readonly SettingsDTO _settings;
        public static SettingsDTO Settings
        {
            get { return _settings; }
        }

        static ODataSettings()
        {
            string configFile = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().GetName().CodeBase), "settings.json").Substring(6);
            if (!File.Exists(configFile))
                CreateJSONSettingFile(configFile);

            if (File.Exists(configFile))
            {
                _settings = new SettingsDTO();
                _settings.Initialize(configFile);
            }
            else
            {
                // check point, if file still doesn't exist throw out..
                throw new ApplicationException("Config not found at " + configFile);
            }
        }

        private static void CreateJSONSettingFile(string configFile)
        {
            // write JSON directly to a file
            using (StreamWriter file = File.CreateText(configFile))
            using (JsonTextWriter writer = new JsonTextWriter(file))
            {
                JObject jObj = JObject.FromObject(new InternlODataSettings(new SettingsDTO()));
                jObj.WriteTo(writer);
            }
        }

        public class InternlODataSettings
        {
            public InternlODataSettings() { }
            public InternlODataSettings(SettingsDTO settingDTO)
            {
                host = settingDTO.Host;
                user = settingDTO.User;
                password = settingDTO.Password;
                model = settingDTO.Model;
                angles_query = settingDTO.AnglesQuery;
                timeout = settingDTO.TimeOut;
                page_size = settingDTO.PageSize;
                max_angles = settingDTO.MaxAngles;
                metadata_resync_minutes = settingDTO.MetadataResyncMinutes;
                web_client_uri = settingDTO.WebClientUri;
            }

            public string host { get; set; }
            public string user { get; set; }
            public string password { get; set; }
            public int? model { get; set; }
            public string angles_query { get; set; }
            public int? timeout { get; set; }
            public int? page_size { get; set; }
            public int? max_angles { get; set; }
            public int? metadata_resync_minutes { get; set; }
            public string web_client_uri { get; set; }
        }
    }

    public class SettingsDTO
    {
        [JsonProperty(PropertyName = "host")]
        public string Host
        {
            get { return Get("host", "http://localhost:9080"); }
        }
        [JsonProperty(PropertyName = "user")]
        public string User
        {
            get { return Get("user", "eaadmin"); }
        }
        [JsonProperty(PropertyName = "password")]
        public string Password
        {
            get { return Get("password", "P@ssw0rd"); }
        }
        [JsonProperty(PropertyName = "model")]
        public int Model
        {
            get { return Get("model", 1).Value; }
        }
        [JsonProperty(PropertyName = "web_client_uri")]
        public string WebClientUri
        {
            get { return Get("web_client_uri", "http://localhost:7948/"); }
        }
        [JsonProperty(PropertyName = "angles_query")]
        public string AnglesQuery
        {
            get { return Get("angles_query", string.Empty); }
        }
        [JsonProperty(PropertyName = "timeout")]
        public int TimeOut
        {
            get { return Get("timeout", 30000).Value; }
        }
        [JsonProperty(PropertyName = "page_size")]
        public int PageSize
        {
            get { return Get("page_size", 500).Value; }
        }
        [JsonProperty(PropertyName = "max_angles")]
        public int? MaxAngles
        {
            get { return Get("max_angles", 500); }
        }
        [JsonProperty(PropertyName = "metadata_resync_minutes")]
        public int MetadataResyncMinutes
        {
            get { return Get("metadata_resync_minutes", 10).Value; }
        }

        private string _filePath;
        private JObject _settings;

        public JObject Settings
        {
            get { return _settings; }
        }

        public void Initialize(string file)
        {
            _filePath = file;
            // read JSON directly from a file
            using (StreamReader settingFile = File.OpenText(_filePath))
            using (JsonTextReader reader = new JsonTextReader(settingFile))
            {
                _settings = JToken.ReadFrom(reader).As<JObject>();
            }
        }

        #region private fields and housekeeping

        public void Update(IDictionary<string, string> updatedFields)
        {
            if (!updatedFields.Any())
                return;

            foreach (var updatedField in updatedFields)
            {
                JToken updatingToken;
                if (_settings.TryGetValue(updatedField.Key, out updatingToken))
                {
                    _settings[updatedField.Key] = updatedField.Value;
                }
            }
            Save();
        }
        public void Update(string key, string value)
        {
            _settings[key] = value;
            Save();
        }
        public void Set(string key, string value)
        {
            _settings[key] = value;
        }
        public void Save()
        {
            // write JSON directly to a file
            using (StreamWriter file = File.CreateText(_filePath))
            using (JsonTextWriter writer = new JsonTextWriter(file))
            {
                _settings.WriteTo(writer);
            }
        }
        public string Get(string name, string defaultValue)
        {
            JToken jtoken;
            if (_settings == null)
                return defaultValue;

            if (_settings.TryGetValue(name, StringComparison.InvariantCultureIgnoreCase, out jtoken))
                return jtoken.Value<string>();

            return defaultValue;
        }
        public int? Get(string name, int? defaultValue)
        {
            string stringValue = defaultValue.HasValue ? Get(name, defaultValue.Value.ToString(CultureInfo.CurrentCulture)) : string.Empty;
            if (string.IsNullOrEmpty(stringValue))
                return defaultValue;

            int outputValue;
            if (int.TryParse(stringValue, out outputValue))
                return outputValue;

            return defaultValue;
        }

        #endregion private fields and housekeeping
    }
}