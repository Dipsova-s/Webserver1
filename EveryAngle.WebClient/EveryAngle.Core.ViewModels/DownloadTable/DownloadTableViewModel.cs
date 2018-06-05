namespace EveryAngle.Core.ViewModels.DownloadTable
{
    public class DownloadTableViewModel
    {
        public virtual string id { get; set; }
        public virtual string uri { get; set; }
        public virtual string local_name { get; set; }
        public virtual string external_name { get; set; }
        public virtual string description { get; set; }
        public virtual string table_group { get; set; }
        public virtual string condition { get; set; }
        public virtual string custom_condition { get; set; }
        public virtual bool delta_download { get; set; }
        public virtual string delta_condition { get; set; }
        public virtual bool download_all_fields { get; set; }
        public virtual string fields_uri { get; set; }
        public virtual int total_field_count { get; set; }
        public virtual int enabled_field_count { get; set; }
        public virtual bool? specify_tables { get; set; }
    }

    public class DownloadTableFieldViewModel
    {
        public virtual string id { get; set; }
        public virtual string name { get; set; }
        public virtual string uri { get; set; }
        public virtual string description { get; set; }
        public virtual string table_group { get; set; }
        public virtual bool is_key_field { get; set; }
        public virtual bool is_mandatory { get; set; }
        public virtual string datatype { get; set; }
        public virtual int size { get; set; }
        public virtual string domain { get; set; }
        public virtual string rolename { get; set; }
        public virtual bool is_enabled { get; set; }
    }
}
