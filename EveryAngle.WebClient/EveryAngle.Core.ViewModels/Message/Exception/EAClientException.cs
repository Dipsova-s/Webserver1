using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.Message.Exception
{

    public class EAClientException : EAException
    {
        protected EAClientException()
        { }
        protected EAClientException(string message) : base(message) { }
        protected EAClientException(string message, System.Exception innerException) : base(message, innerException) { }
        protected EAClientException(System.Exception innerException) : base(String.Empty, innerException) { }

    }

}
