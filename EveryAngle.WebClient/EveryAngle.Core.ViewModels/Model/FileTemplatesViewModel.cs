using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.Core.ViewModels.Model
{
    public class FileTemplatesViewModel
    {
        [JsonProperty(PropertyName = "file")]
        public string File { get; set; }

        [JsonProperty(PropertyName = "size")]
        public long Size { get; set; }

        [JsonProperty(PropertyName = "modified")]
        public long Modified { get; set; }

        [JsonProperty(PropertyName = "uri")]
        public string Uri { get; set; }

        [JsonProperty(PropertyName = "is_default_file")]
        public bool IsDefaultFile { get; set; }

        [JsonProperty(PropertyName = "has_innowera_process")]
        public bool HasInnoweraProcess { get; set; }

        [JsonProperty(PropertyName = "innowera_process_details")]
        public List<InnoweraProcess> InnoweraProcessDetails { get; set; }

        public string ReInnoweraProcessList
        {
            get
            {
                if (InnoweraProcessDetails != null)
                {
                    return string.Join(", ", InnoweraProcessDetails.Select(x => x.SapProcessName));
                }
                return string.Empty;
            }
        }

        public string ReInnoweraDisplayList
        {
            get
            {
                if (InnoweraProcessDetails != null)
                {
                    return string.Join(", ", InnoweraProcessDetails.Select(x => x.DisplayName));
                }
                return string.Empty;
            }
        }

    }

    public class InnoweraProcess
    {
        [JsonProperty(PropertyName = "display_name")]
        public string DisplayName { get; set; }

        [JsonProperty(PropertyName = "sap_process_name")]
        public string SapProcessName { get; set; }
    }
}
