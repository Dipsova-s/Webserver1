namespace EveryAngle.OData.ViewModel
{
    public class ResponseStatusViewModel
    {
        public ResponseStatusViewModel()
        {

        }
        public ResponseStatusViewModel(string returnReason, string returnMessage)
        {
            reason = returnReason;
            message = returnMessage;
        }

        public string reason { get; set; }
        public string message { get; set; }
    }
}
