using EveryAngle.OData.DTO;
using EveryAngle.OData.Utils;
using System.Linq;

namespace EveryAngle.OData.ViewModel
{
    public class EntryEntitiesViewModel : BaseEntitiesViewModel
    {
        #region constructors

        public EntryEntitiesViewModel(Angle angle, string webClientUri)
        {
            name = angle.name;
            entity_id = angle.uri.IdFromUri();
            web_client_uri = string.Format("{0}/en/angle/anglepage#/?angle={1}&display=default", webClientUri, angle.uri);
            is_template = angle.is_template;
            item_type = angle.is_template ? "template" : "angle";
            hasChildren = angle.displays_summary.Any();
        }

        public EntryEntitiesViewModel(Display display, string webClientUri)
        {
            name = display.name;
            web_client_uri = string.Format("{0}/en/angle/anglepage#/?angle={1}&display={2}", webClientUri, display.angle_uri, display.uri);
            parent_id = display.angle_id.As<int>();
            item_type = display.display_type;
            entity_id = GetUniqueRangeEntityId(display.uri.IdFromUri());
            entity_uri = display.UniqueEntityName();
            hasChildren = false;
        }

        #endregion constructors

        #region public variables

        public bool? is_template { get; set; }
        public string entity_uri { get; set; }
        public int? parent_id { get; set; }

        // kendoui mapping
        public bool hasChildren { get; set; }

        #endregion public variables

        #region private functions

        private int GetUniqueRangeEntityId(int currentId)
        {
            int range = 2000000;
            return (range + currentId + parent_id.Value);
        }

        #endregion private functions
    }
}