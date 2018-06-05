using System.ComponentModel.DataAnnotations;

namespace EveryAngle.OData.ViewModel.Metadata
{
    public class MetadataProcessViewModel
    {
        public MetadataProcessViewModel()
        {
            sync = false;
        }

        [Required]
        public bool sync { get; set; }

        public bool check { get; set; }
    }
}
