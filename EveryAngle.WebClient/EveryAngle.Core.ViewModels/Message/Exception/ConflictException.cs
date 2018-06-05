using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.Core.ViewModels.Message.Exception
{
    public class ConflictException : EAAppServerException
    {
        public ConflictException(string message)
            : base(message)
        {

        }

        public ConflictException(int statusCode, string message)
            : base(statusCode, message)
        {

        }
    }
}
