using EveryAngle.WebClient.Domain.Enums;
using Newtonsoft.Json;
using System;

namespace EveryAngle.Core.ViewModels
{
    public class ComponentViewModel
    {
        [JsonProperty(PropertyName = "registration_id")]
        public Guid? RegistrationId { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "type")]
        private string type { get; set; }
        public ComponentServiceManagerType Type
        {
            get
            {
                Enum.TryParse(type, out ComponentServiceManagerType output);
                return output;
            }
        }

        public string TypeName
        {
            get { return Type.ToString(); }
        }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "uri")]
        public string Uri { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "model_id")]
        public string ModelId { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "version")]
        public string Version { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "machine_name")]
        public string MachineName { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "status")]
        public RegistrationStatus Status { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "registered_on")]
        public long? RegisteredOn { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "last_successful_heartbeat")]
        public long? LastSuccessfulHeartbeat { get; set; }

        public bool IsDeletable
        {
            get
            {
                return Type != ComponentServiceManagerType.ApplicationServer
                    && Type != ComponentServiceManagerType.WebServer;
            }
        }

        public bool IsDownloadMetadataEnabled
        {
            get
            {
                return Type == ComponentServiceManagerType.ClassicModelQueryService
                    || Type == ComponentServiceManagerType.DataDiscoveryService;
            }
        }

        public bool IsInfoEnabled
        {
            get
            {
                return Type == ComponentServiceManagerType.ClassicModelQueryService
                    || Type == ComponentServiceManagerType.DataDiscoveryService
                    || Type == ComponentServiceManagerType.ExtractionService;
            }
        }
    }
}
