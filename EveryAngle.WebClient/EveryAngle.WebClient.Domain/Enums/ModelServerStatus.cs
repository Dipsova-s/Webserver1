using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EveryAngle.WebClient.Domain.Enums
{
    public enum ModelServerStatus
    {
        Unknown,
        Idle,
        Running,
        Extracting,
        Postprocessing,
        Up,
        Down
    }
}
