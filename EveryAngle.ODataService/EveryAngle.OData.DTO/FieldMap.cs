namespace EveryAngle.OData.DTO
{
    public class FieldMap
    {
        public int Index;
        public bool IsDate;
        public bool IsDouble;
        public bool IsPeriod;
        public bool IsDecimal;
        public bool IsTime;
        public bool IsEnumerated;
        public bool NeedsConversion;

        public void SetConversionNeeded()
        {
            NeedsConversion = IsDate    ||  IsDouble     ||
                              IsPeriod  ||  IsDecimal    ||
                              IsTime    ||  IsEnumerated;
        }
    }
}
