using EveryAngle.OData.DTO.Settings;

namespace EveryAngle.OData.ViewModel.Settings
{
    public class ODataSettingsViewModel
    {
        public string host { get; set; } = "http://th-eatst02.everyangle.org:57110";
        public string user { get; set; } = "eaadmin";
        public string password { get; set; } = "P@ssw0rd";
        public string model_id { get; set; } = "EA2_800";
        public string angles_query { get; set; } = string.Empty;
        public int? timeout { get; set; } = 30000;
        public int? page_size { get; set; } = 500;
        public int? max_angles { get; set; } = 500;
        public int? metadata_resync_minutes { get; set; } = 10;
        public string web_client_uri { get; set; } = "http://th-eatst02.theatst.org/release2017_sub11";

        public SettingsDTO Convert()
        {
            return new SettingsDTO
            {
                Host = host,
                User = user,
                Password = password,
                ModelId = model_id,
                WebClientUri = web_client_uri,
                AnglesQuery = angles_query,
                TimeOut = timeout.Value,
                PageSize = page_size.Value,
                MaxAngles = max_angles,
                MetadataResyncMinutes = metadata_resync_minutes.Value
            };
        }
    }
}
