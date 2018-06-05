using System;
using System.Runtime.Serialization;

namespace EveryAngle.Core.ViewModels.Privilege
{
    [Serializable]
    public class PrivilegesForModelViewModel
    {
        [LocalizedDisplayName("MC_ManageModel")]
        [DataMember(EmitDefaultValue = false)]
        public bool? manage_model { get; set; }

        [LocalizedDisplayName("MC_CreateTemplateAngle")]
        [DataMember(EmitDefaultValue = false)]

        public bool? create_template_angles { get; set; }

        [LocalizedDisplayName("MC_CreateAngle")]
        [DataMember(EmitDefaultValue = false)]

        public bool? create_angles { get; set; }

        [DataMember(EmitDefaultValue = false)]
        [LocalizedDisplayName("MC_AllowPrivateAngles")]
        public bool? allow_private_angles { get; set; }

        [LocalizedDisplayName("MC_SaveDisplay")]
        [DataMember(EmitDefaultValue = false)]

        public bool? save_displays { get; set; }
        [LocalizedDisplayName("MC_UseNonDefaultDisplaysAngles")]
        [DataMember(EmitDefaultValue = false)]

        public bool? allow_nondefault_displays { get; set; }
        [LocalizedDisplayName("MC_AllowListDisplays")]
        [DataMember(EmitDefaultValue = false)]

        public bool? allow_list_displays { get; set; }
        [LocalizedDisplayName("MC_AllowMoreDetails")]
        [DataMember(EmitDefaultValue = false)]

        public bool? allow_more_details { get; set; }
        [LocalizedDisplayName("MC_AllowRelatedReports")]
        [DataMember(EmitDefaultValue = false)]

        public bool? allow_related_reports { get; set; }
        [LocalizedDisplayName("MC_Jump")]
        [DataMember(EmitDefaultValue = false)]

        public bool? allow_followups { get; set; }
        [LocalizedDisplayName("MC_GoToSAP")]
        [DataMember(EmitDefaultValue = false)]

        public bool? allow_goto_sap { get; set; }
        [LocalizedDisplayName("MC_RPCAllowed")]
        [DataMember(EmitDefaultValue = false)]

        public bool? allow_rpc { get; set; }
        [LocalizedDisplayName("MC_ExportData")]
        [DataMember(EmitDefaultValue = false)]

        public bool? allow_export { get; set; }

        [LocalizedDisplayName("MC_AdvancedFilterSearch")]
        [DataMember(EmitDefaultValue = false)]

        public bool? allow_advanced_filter { get; set; }

        [LocalizedDisplayName("MC_SingleItemView")]
        [DataMember(EmitDefaultValue = false)]
        public bool? allow_single_item_view { get; set; }

        [LocalizedDisplayName("MC_WebClientLogin")]
        [DataMember(EmitDefaultValue = false)]
        public bool? access_data_via_webclient { get; set; }

        [LocalizedDisplayName("MC_PublishDashboard")]
        [DataMember(EmitDefaultValue = false)]

        public bool? allow_publish_dashboards { get; set; }

        [LocalizedDisplayName("MC_DisplayPrivateItem")]
        [DataMember(EmitDefaultValue = false)]
        public bool? manage_private_items { get; set; }

        [LocalizedDisplayName("MC_MaxExportRows")]
        [DataMember(EmitDefaultValue = false)]
        public int? max_export_rows { get; set; }

        [LocalizedDisplayName("MC_AllowNonValidatedItems")]
        [DataMember(EmitDefaultValue = false)]
        public bool? allow_nonvalidated_items { get; set; }

        [LocalizedDisplayName("MC_ODataLogin")]
        [DataMember(EmitDefaultValue = false)]
        public bool? access_data_via_odata { get; set; }
    }
}
