namespace EveryAngle.OData.DTO.Settings
{
    // just a poco here
    public class SettingsDTO
    {
        public string Host { get; set; }
        public string User { get; set; }
        public string Password { get; set; }
        public string ModelId { get; set; }
        public string WebClientUri { get; set; }
        public string AnglesQuery { get; set; }
        public int TimeOut { get; set; }
        public int PageSize { get; set; }
        public int? MaxAngles { get; set; }
        public int MetadataResyncMinutes { get; set; }
    }
}
