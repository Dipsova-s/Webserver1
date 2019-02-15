using EveryAngle.Core.ViewModels.ModelServer;
using EveryAngle.WebClient.Domain.Enums;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;

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
            get { return type; }
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

        public ModelServerInfoViewModel ModelServer { get; internal set; } = new ModelServerInfoViewModel();

        public bool IsDeletable
        {
            get
            {
                ComponentServiceManagerType[] checkTypes = new ComponentServiceManagerType[]
                {
                    ComponentServiceManagerType.ApplicationServer,
                    ComponentServiceManagerType.WebServer
                };
                return !checkTypes.Contains(Type);
            }
        }

        public bool IsDownloadMetadataEnabled
        {
            get
            {
                ComponentServiceManagerType[] checkTypes = new ComponentServiceManagerType[]
                {
                    ComponentServiceManagerType.ClassicModelQueryService,
                    ComponentServiceManagerType.RealtimeModelQueryService
                };
                return checkTypes.Contains(Type) && Equals(true, Status.Available) && !string.IsNullOrEmpty(ModelServer.MetadataUri);
            }
        }

        public bool IsInfoEnabled
        {
            get
            {
                ComponentServiceManagerType[] checkTypes = new ComponentServiceManagerType[]
                {
                    ComponentServiceManagerType.ClassicModelQueryService,
                    ComponentServiceManagerType.RealtimeModelQueryService,
                    ComponentServiceManagerType.ExtractionService
                };
                return checkTypes.Contains(Type);
            }
        }

        public void SetModelServerInfo(List<ModelServerViewModel> modelServers, Uri currentInstance)
        {
            ModelServerViewModel modelServer = modelServers.FirstOrDefault(x => new Uri(x.server_uri) == new Uri(Uri));
            if (modelServer != null)
            {
                ModelServer.Uri = modelServer.Uri.ToString();
                ModelServer.MetadataUri = modelServer.metadata;
                ModelServer.MetadataName = $"{modelServer.id}_{modelServer.instance_id}";
                ModelServer.IsCurrentInstance = currentInstance != null && currentInstance == modelServer.instance;
            }
        }
    }

    public class ModelServerInfoViewModel
    {
        public string Uri { get; set; }
        public string MetadataUri { get; set; }
        public string MetadataName { get; set; }
        public bool IsCurrentInstance { get; set; }
    }
}
