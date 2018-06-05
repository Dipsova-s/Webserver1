namespace EveryAngle.OData.DTO
{
    public class Session
    {
        public string id { get; set; }
        public string user { get; set; }
        public string security_token { get; set; }
        public long expiration_time { get; set; }
        public string uri { get; set; }
        public string model_privileges { get; set; }
    } 
}
