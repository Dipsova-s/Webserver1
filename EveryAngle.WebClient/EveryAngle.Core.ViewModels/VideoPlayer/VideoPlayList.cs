using System.Collections.Generic;

namespace EveryAngle.Core.ViewModels.VideoPlayer
{
    public class VideoPlayList
    {
        public string name { get; set; }
        public IList<VideoSource> sources { get; set; }
        public IList<VideoThumbnail> thumbnail { get; set; }
    }
}
