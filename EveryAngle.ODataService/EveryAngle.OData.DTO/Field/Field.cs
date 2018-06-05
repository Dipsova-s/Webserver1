namespace EveryAngle.OData.DTO
{
    public class Field : BaseDTO<FieldCompositeKey>, IBaseDTO<FieldCompositeKey>, IMetadata
    {
        public string field { get { return id; } set { id = value; } }
        public string short_name { get; set; }
        public string long_name { get; set; }
        public UserSpecific user_specific { get; set; }
        public string tech_info { get; set; }
        public string domain { get; set; }
        public string source { get; set; }
        public string helpid { get; set; }
        public string category { get; set; }
        public string fieldtype { get; set; }
        public string helptext { get; set; }
        public int? fieldlength { get; set; }

        // used in Display only
        public bool valid { get; set; }

        public override FieldCompositeKey CreateCompositeKey()
        {
            FieldCompositeKey compositeKey = base.CreateCompositeKey();
            compositeKey.BusinessId = id;
            return compositeKey;
        }

        public FieldCompositeKey UpdateUniqueXMLElementKey(string key)
        {
            if (CompositeKey == null)
                CreateCompositeKey();

            CompositeKey.UniqueXMLElementKey = key;
            return CompositeKey;
        }
    }
}
