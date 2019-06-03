﻿using System.Collections.Generic;

namespace EveryAngle.Shared.Helpers
{
    public class MimeTypeUtilities
    {
        private readonly IDictionary<string, string> mimeTypeDics = new Dictionary<string, string>();

        public MimeTypeUtilities() 
        {
            PrepareMimeTypeDics();
        }
        
        public string GetMimeType(string filename)
        {
            return GetRetval(System.IO.Path.GetExtension(filename).ToLower());
        }

        private void PrepareMimeTypeDics()
        {
            mimeTypeDics.Add(".3dm", "x-world/x-3dmf");
            mimeTypeDics.Add("3dmf", "x-world/x-3dmf");
            mimeTypeDics.Add(".a", "application/octet-stream");
            mimeTypeDics.Add(".aab", "application/x-authorware-bin");
            mimeTypeDics.Add(".aam", "application/x-authorware-map");
            mimeTypeDics.Add(".aas", "application/x-authorware-seg");
            mimeTypeDics.Add(".abc", "text/vnd.abc");
            mimeTypeDics.Add(".acgi", "text/html");
            mimeTypeDics.Add(".afl", "video/animaflex");
            mimeTypeDics.Add(".ai", "application/postscript");
            mimeTypeDics.Add(".aif", "audio/aiff");
            mimeTypeDics.Add(".aifc", "audio/aiff");
            mimeTypeDics.Add(".aiff", "audio/aiff");
            mimeTypeDics.Add(".aim", "application/x-aim");
            mimeTypeDics.Add(".aip", "text/x-audiosoft-intra");
            mimeTypeDics.Add(".ani", "application/x-navi-animation");
            mimeTypeDics.Add(".aos", "application/x-nokia-9000-communicator-add-on-software");
            mimeTypeDics.Add(".aps", "application/mime");
            mimeTypeDics.Add(".arc", "application/octet-stream");
            mimeTypeDics.Add(".arj", "application/arj");
            mimeTypeDics.Add(".art", "image/x-jg");
            mimeTypeDics.Add(".asf", "video/x-ms-asf");
            mimeTypeDics.Add(".asm", "text/x-asm");
            mimeTypeDics.Add(".asp", "text/asp");
            mimeTypeDics.Add(".asx", "video/x-ms-asf");
            mimeTypeDics.Add(".au", "audio/basic");
            mimeTypeDics.Add(".avi", "video/avi");
            mimeTypeDics.Add(".avs", "video/avs-video");
            mimeTypeDics.Add(".bcpio", "application/x-bcpio");
            mimeTypeDics.Add(".bin", "application/octet-stream");
            mimeTypeDics.Add(".bm", "image/bmp");
            mimeTypeDics.Add(".bmp", "image/bmp");
            mimeTypeDics.Add(".boo", "application/book");
            mimeTypeDics.Add(".book", "application/book");
            mimeTypeDics.Add(".boz", "application/x-bzip2");
            mimeTypeDics.Add(".bsh", "application/x-bsh");
            mimeTypeDics.Add(".bz", "application/x-bzip");
            mimeTypeDics.Add(".bz2", "application/x-bzip2");
            mimeTypeDics.Add(".c", "text/plain");
            mimeTypeDics.Add(".c++", "text/plain");
            mimeTypeDics.Add(".cat", "application/vnd.ms-pki.seccat");
            mimeTypeDics.Add(".cc", "text/plain");
            mimeTypeDics.Add(".ccad", "application/clariscad");
            mimeTypeDics.Add(".cco", "application/x-cocoa");
            mimeTypeDics.Add(".cdf", "application/cdf");
            mimeTypeDics.Add(".cer", "application/pkix-cert");
            mimeTypeDics.Add(".cha", "application/x-chat");
            mimeTypeDics.Add(".chat", "application/x-chat");
            mimeTypeDics.Add(".class", "application/java");
            mimeTypeDics.Add(".com", "application/octet-stream");
            mimeTypeDics.Add(".conf", "text/plain");
            mimeTypeDics.Add(".cpio", "application/x-cpio");
            mimeTypeDics.Add(".cpp", "text/x-c");
            mimeTypeDics.Add(".cpt", "application/x-cpt");
            mimeTypeDics.Add(".crl", "application/pkcs-crl");
            mimeTypeDics.Add(".crt", "application/pkix-cert");
            mimeTypeDics.Add(".csh", "application/x-csh");
            mimeTypeDics.Add(".css", "text/css");
            mimeTypeDics.Add(".cxx", "text/plain");
            mimeTypeDics.Add(".dcr", "application/x-director");
            mimeTypeDics.Add(".deepv", "application/x-deepv");
            mimeTypeDics.Add(".def", "text/plain");
            mimeTypeDics.Add(".der", "application/x-x509-ca-cert");
            mimeTypeDics.Add(".dif", "video/x-dv");
            mimeTypeDics.Add(".dir", "application/x-director");
            mimeTypeDics.Add(".dl", "video/dl");
            mimeTypeDics.Add(".doc", "application/msword");
            mimeTypeDics.Add(".dot", "application/msword");
            mimeTypeDics.Add(".dp", "application/commonground");
            mimeTypeDics.Add(".drw", "application/drafting");
            mimeTypeDics.Add(".dump", "application/octet-stream");
            mimeTypeDics.Add(".dv", "video/x-dv");
            mimeTypeDics.Add(".dvi", "application/x-dvi");
            mimeTypeDics.Add(".dwf", "model/vnd.dwf");
            mimeTypeDics.Add(".dwg", "image/vnd.dwg");
            mimeTypeDics.Add(".dxf", "image/vnd.dwg");
            mimeTypeDics.Add(".dxr", "application/x-director");
            mimeTypeDics.Add(".el", "text/x-script.elisp");
            mimeTypeDics.Add(".elc", "application/x-elc");
            mimeTypeDics.Add(".env", "application/x-envoy");
            mimeTypeDics.Add(".eps", "application/postscript");
            mimeTypeDics.Add(".es", "application/x-esrehber");
            mimeTypeDics.Add(".etx", "text/x-setext");
            mimeTypeDics.Add(".evy", "application/envoy");
            mimeTypeDics.Add(".exe", "application/octet-stream");
            mimeTypeDics.Add(".f", "text/plain");
            mimeTypeDics.Add(".f77", "text/x-fortran");
            mimeTypeDics.Add(".f90", "text/plain");
            mimeTypeDics.Add(".fdf", "application/vnd.fdf");
            mimeTypeDics.Add(".fif", "image/fif");
            mimeTypeDics.Add(".fli", "video/fli");
            mimeTypeDics.Add(".flo", "image/florian");
            mimeTypeDics.Add(".flx", "text/vnd.fmi.flexstor");
            mimeTypeDics.Add(".fmf", "video/x-atomic3d-feature");
            mimeTypeDics.Add(".for", "text/x-fortran");
            mimeTypeDics.Add(".fpx", "image/vnd.fpx");
            mimeTypeDics.Add(".frl", "application/freeloader");
            mimeTypeDics.Add(".funk", "audio/make");
            mimeTypeDics.Add(".g", "text/plain");
            mimeTypeDics.Add(".g3", "image/g3fax");
            mimeTypeDics.Add(".gif", "image/gif");
            mimeTypeDics.Add(".gl", "video/gl");
            mimeTypeDics.Add(".gsd", "audio/x-gsm");
            mimeTypeDics.Add(".gsm", "audio/x-gsm");
            mimeTypeDics.Add(".gsp", "application/x-gsp");
            mimeTypeDics.Add(".gss", "application/x-gss");
            mimeTypeDics.Add(".gtar", "application/x-gtar");
            mimeTypeDics.Add(".gz", "application/x-gzip");
            mimeTypeDics.Add(".gzip", "application/x-gzip");
            mimeTypeDics.Add(".h", "text/plain");
            mimeTypeDics.Add(".hdf", "application/x-hdf");
            mimeTypeDics.Add(".help", "application/x-helpfile");
            mimeTypeDics.Add(".hgl", "application/vnd.hp-hpgl");
            mimeTypeDics.Add(".hh", "text/plain");
            mimeTypeDics.Add(".hlb", "text/x-script");
            mimeTypeDics.Add(".hlp", "application/hlp");
            mimeTypeDics.Add(".hpg", "application/vnd.hp-hpgl");
            mimeTypeDics.Add(".hpgl", "application/vnd.hp-hpgl");
            mimeTypeDics.Add(".hqx", "application/binhex");
            mimeTypeDics.Add(".hta", "application/hta");
            mimeTypeDics.Add(".htc", "text/x-component");
            mimeTypeDics.Add(".htm", "text/html");
            mimeTypeDics.Add(".html", "text/html");
            mimeTypeDics.Add(".htmls", "text/html");
            mimeTypeDics.Add(".htt", "text/webviewhtml");
            mimeTypeDics.Add(".htx", "text/html");
            mimeTypeDics.Add(".ice", "x-conference/x-cooltalk");
            mimeTypeDics.Add(".ico", "image/x-icon");
            mimeTypeDics.Add(".idc", "text/plain");
            mimeTypeDics.Add(".ief", "image/ief");
            mimeTypeDics.Add(".iefs", "image/ief");
            mimeTypeDics.Add(".iges", "application/iges");
            mimeTypeDics.Add(".igs", "application/iges");
            mimeTypeDics.Add(".ima", "application/x-ima");
            mimeTypeDics.Add(".imap", "application/x-httpd-imap");
            mimeTypeDics.Add(".inf", "application/inf");
            mimeTypeDics.Add(".ins", "application/x-internett-signup");
            mimeTypeDics.Add(".ip", "application/x-ip2");
            mimeTypeDics.Add(".isu", "video/x-isvideo");
            mimeTypeDics.Add(".it", "audio/it");
            mimeTypeDics.Add(".iv", "application/x-inventor");
            mimeTypeDics.Add(".ivr", "i-world/i-vrml");
            mimeTypeDics.Add(".ivy", "application/x-livescreen");
            mimeTypeDics.Add(".jam", "audio/x-jam");
            mimeTypeDics.Add(".jav", "text/plain");
            mimeTypeDics.Add(".java", "text/plain");
            mimeTypeDics.Add(".jcm", "application/x-java-commerce");
            mimeTypeDics.Add(".jfif", "image/jpeg");
            mimeTypeDics.Add(".jfif-tbnl", "image/jpeg");
            mimeTypeDics.Add(".jpe", "image/jpeg");
            mimeTypeDics.Add(".jpeg", "image/jpeg");
            mimeTypeDics.Add(".jpg", "image/jpeg");
            mimeTypeDics.Add(".jps", "image/x-jps");
            mimeTypeDics.Add(".js", "application/x-javascript");
            mimeTypeDics.Add(".jut", "image/jutvision");
            mimeTypeDics.Add(".kar", "audio/midi");
            mimeTypeDics.Add(".ksh", "application/x-ksh");
            mimeTypeDics.Add(".la", "audio/nspaudio");
            mimeTypeDics.Add(".lam", "audio/x-liveaudio");
            mimeTypeDics.Add(".latex", "application/x-latex");
            mimeTypeDics.Add(".lha", "application/octet-stream");
            mimeTypeDics.Add(".lhx", "application/octet-stream");
            mimeTypeDics.Add(".list", "text/plain");
            mimeTypeDics.Add(".lma", "audio/nspaudio");
            mimeTypeDics.Add(".log", "text/plain");
            mimeTypeDics.Add(".lsp", "application/x-lisp");
            mimeTypeDics.Add(".lst", "text/plain");
            mimeTypeDics.Add(".lsx", "text/x-la-asf");
            mimeTypeDics.Add(".ltx", "application/x-latex");
            mimeTypeDics.Add(".lzh", "application/octet-stream");
            mimeTypeDics.Add(".lzx", "application/octet-stream");
            mimeTypeDics.Add(".m", "text/plain");
            mimeTypeDics.Add(".m1v", "video/mpeg");
            mimeTypeDics.Add(".m2a", "audio/mpeg");
            mimeTypeDics.Add(".m2v", "video/mpeg");
            mimeTypeDics.Add(".m3u", "audio/x-mpequrl");
            mimeTypeDics.Add(".man", "application/x-troff-man");
            mimeTypeDics.Add(".map", "application/x-navimap");
            mimeTypeDics.Add(".mar", "text/plain");
            mimeTypeDics.Add(".mbd", "application/mbedlet");
            mimeTypeDics.Add(".mc$", "application/x-magic-cap-package-1.0");
            mimeTypeDics.Add(".mcd", "application/mcad");
            mimeTypeDics.Add(".mcf", "text/mcf");
            mimeTypeDics.Add(".mcp", "application/netmc");
            mimeTypeDics.Add(".me", "application/x-troff-me");
            mimeTypeDics.Add(".mht", "message/rfc822");
            mimeTypeDics.Add(".mhtml", "message/rfc822");
            mimeTypeDics.Add(".mid", "audio/midi");
            mimeTypeDics.Add(".midi", "audio/midi");
            mimeTypeDics.Add(".mif", "application/x-mif");
            mimeTypeDics.Add(".mime", "message/rfc822");
            mimeTypeDics.Add(".mjf", "audio/x-vnd.audioexplosion.mjuicemediafile");
            mimeTypeDics.Add(".mjpg", "video/x-motion-jpeg");
            mimeTypeDics.Add(".mm", "application/base64");
            mimeTypeDics.Add(".mme", "application/base64");
            mimeTypeDics.Add(".mod", "audio/mod");
            mimeTypeDics.Add(".moov", "video/quicktime");
            mimeTypeDics.Add(".mov", "video/quicktime");
            mimeTypeDics.Add(".movie", "video/x-sgi-movie");
            mimeTypeDics.Add(".mp2", "audio/mpeg");
            mimeTypeDics.Add(".mp3", "audio/mpeg");
            mimeTypeDics.Add(".mpa", "audio/mpeg");
            mimeTypeDics.Add(".mpc", "application/x-project");
            mimeTypeDics.Add(".mpe", "video/mpeg");
            mimeTypeDics.Add(".mpeg", "video/mpeg");
            mimeTypeDics.Add(".mpg", "video/mpeg");
            mimeTypeDics.Add(".mpga", "audio/mpeg");
            mimeTypeDics.Add(".mpp", "application/vnd.ms-project");
            mimeTypeDics.Add(".mpt", "application/vnd.ms-project");
            mimeTypeDics.Add(".mpv", "application/vnd.ms-project");
            mimeTypeDics.Add(".mpx", "application/vnd.ms-project");
            mimeTypeDics.Add(".mrc", "application/marc");
            mimeTypeDics.Add(".ms", "application/x-troff-ms");
            mimeTypeDics.Add(".mv", "video/x-sgi-movie");
            mimeTypeDics.Add(".my", "audio/make");
            mimeTypeDics.Add(".mzz", "application/x-vnd.audioexplosion.mzz");
            mimeTypeDics.Add(".nap", "image/naplps");
            mimeTypeDics.Add(".naplps", "image/naplps");
            mimeTypeDics.Add(".nc", "application/x-netcdf");
            mimeTypeDics.Add(".ncm", "application/vnd.nokia.configuration-message");
            mimeTypeDics.Add(".nif", "image/x-niff");
            mimeTypeDics.Add(".niff", "image/x-niff");
            mimeTypeDics.Add(".nix", "application/x-mix-transfer");
            mimeTypeDics.Add(".nsc", "application/x-conference");
            mimeTypeDics.Add(".nvd", "application/x-navidoc");
            mimeTypeDics.Add(".o", "application/octet-stream");
            mimeTypeDics.Add(".oda", "application/oda");
            mimeTypeDics.Add(".omc", "application/x-omc");
            mimeTypeDics.Add(".omcd", "application/x-omcdatamaker");
            mimeTypeDics.Add(".omcr", "application/x-omcregerator");
            mimeTypeDics.Add(".p", "text/x-pascal");
            mimeTypeDics.Add(".p10", "application/pkcs10");
            mimeTypeDics.Add(".p12", "application/pkcs-12");
            mimeTypeDics.Add(".p7a", "application/x-pkcs7-signature");
            mimeTypeDics.Add(".p7c", "application/pkcs7-mime");
            mimeTypeDics.Add(".p7m", "application/pkcs7-mime");
            mimeTypeDics.Add(".p7r", "application/x-pkcs7-certreqresp");
            mimeTypeDics.Add(".p7s", "application/pkcs7-signature");
            mimeTypeDics.Add(".part", "application/pro_eng");
            mimeTypeDics.Add(".pas", "text/pascal");
            mimeTypeDics.Add(".pbm", "image/x-portable-bitmap");
            mimeTypeDics.Add(".pcl", "application/vnd.hp-pcl");
            mimeTypeDics.Add(".pct", "image/x-pict");
            mimeTypeDics.Add(".pcx", "image/x-pcx");
            mimeTypeDics.Add(".pdb", "chemical/x-pdb");
            mimeTypeDics.Add(".pdf", "application/pdf");
            mimeTypeDics.Add(".pfunk", "audio/make");
            mimeTypeDics.Add(".pgm", "image/x-portable-greymap");
            mimeTypeDics.Add(".pic", "image/pict");
            mimeTypeDics.Add(".pict", "image/pict");
            mimeTypeDics.Add(".pkg", "application/x-newton-compatible-pkg");
            mimeTypeDics.Add(".pko", "application/vnd.ms-pki.pko");
            mimeTypeDics.Add(".pl", "text/plain");
            mimeTypeDics.Add(".plx", "application/x-pixclscript");
            mimeTypeDics.Add(".pm", "image/x-xpixmap");
            mimeTypeDics.Add(".pm4", "application/x-pagemaker");
            mimeTypeDics.Add(".pm5", "application/x-pagemaker");
            mimeTypeDics.Add(".png", "image/png");
            mimeTypeDics.Add(".pnm", "application/x-portable-anymap");
            mimeTypeDics.Add(".pot", "application/vnd.ms-powerpoint");
            mimeTypeDics.Add(".pov", "model/x-pov");
            mimeTypeDics.Add(".ppa", "application/vnd.ms-powerpoint");
            mimeTypeDics.Add(".ppm", "image/x-portable-pixmap");
            mimeTypeDics.Add(".pps", "application/vnd.ms-powerpoint");
            mimeTypeDics.Add(".ppt", "application/vnd.ms-powerpoint");
            mimeTypeDics.Add(".ppz", "application/vnd.ms-powerpoint");
            mimeTypeDics.Add(".pre", "application/x-freelance");
            mimeTypeDics.Add(".prt", "application/pro_eng");
            mimeTypeDics.Add(".ps", "application/postscript");
            mimeTypeDics.Add(".psd", "application/octet-stream");
            mimeTypeDics.Add(".pvu", "paleovu/x-pv");
            mimeTypeDics.Add(".pwz", "application/vnd.ms-powerpoint");
            mimeTypeDics.Add(".py", "text/x-script.phyton");
            mimeTypeDics.Add(".pyc", "applicaiton/x-bytecode.python");
            mimeTypeDics.Add(".qcp", "audio/vnd.qcelp");
            mimeTypeDics.Add(".qd3", "x-world/x-3dmf");
            mimeTypeDics.Add(".qd3d", "x-world/x-3dmf");
            mimeTypeDics.Add(".qif", "image/x-quicktime");
            mimeTypeDics.Add(".qt", "video/quicktime");
            mimeTypeDics.Add(".qtc", "video/x-qtc");
            mimeTypeDics.Add(".qti", "image/x-quicktime");
            mimeTypeDics.Add(".qtif", "image/x-quicktime");
            mimeTypeDics.Add(".ra", "audio/x-pn-realaudio");
            mimeTypeDics.Add(".ram", "audio/x-pn-realaudio");
            mimeTypeDics.Add(".ras", "application/x-cmu-raster");
            mimeTypeDics.Add(".rast", "image/cmu-raster");
            mimeTypeDics.Add(".rexx", "text/x-script.rexx");
            mimeTypeDics.Add(".rf", "image/vnd.rn-realflash");
            mimeTypeDics.Add(".rgb", "image/x-rgb");
            mimeTypeDics.Add(".rm", "application/vnd.rn-realmedia");
            mimeTypeDics.Add(".rmi", "audio/mid");
            mimeTypeDics.Add(".rmm", "audio/x-pn-realaudio");
            mimeTypeDics.Add(".rmp", "audio/x-pn-realaudio");
            mimeTypeDics.Add(".rng", "application/ringing-tones");
            mimeTypeDics.Add(".rnx", "application/vnd.rn-realplayer");
            mimeTypeDics.Add(".roff", "application/x-troff");
            mimeTypeDics.Add(".rp", "image/vnd.rn-realpix");
            mimeTypeDics.Add(".rpm", "audio/x-pn-realaudio-plugin");
            mimeTypeDics.Add(".rt", "text/richtext");
            mimeTypeDics.Add(".rtf", "text/richtext");
            mimeTypeDics.Add(".rtx", "text/richtext");
            mimeTypeDics.Add(".rv", "video/vnd.rn-realvideo");
            mimeTypeDics.Add(".s", "text/x-asm");
            mimeTypeDics.Add(".s3m", "audio/s3m");
            mimeTypeDics.Add(".saveme", "application/octet-stream");
            mimeTypeDics.Add(".sbk", "application/x-tbook");
            mimeTypeDics.Add(".scm", "application/x-lotusscreencam");
            mimeTypeDics.Add(".sdml", "text/plain");
            mimeTypeDics.Add(".sdp", "application/sdp");
            mimeTypeDics.Add(".sdr", "application/sounder");
            mimeTypeDics.Add(".sea", "application/sea");
            mimeTypeDics.Add(".set", "application/set");
            mimeTypeDics.Add(".sgm", "text/sgml");
            mimeTypeDics.Add(".sgml", "text/sgml");
            mimeTypeDics.Add(".sh", "application/x-sh");
            mimeTypeDics.Add(".shar", "application/x-shar");
            mimeTypeDics.Add(".shtml", "text/html");
            mimeTypeDics.Add(".sid", "audio/x-psid");
            mimeTypeDics.Add(".sit", "application/x-sit");
            mimeTypeDics.Add(".skd", "application/x-koan");
            mimeTypeDics.Add(".skm", "application/x-koan");
            mimeTypeDics.Add(".skp", "application/x-koan");
            mimeTypeDics.Add(".skt", "application/x-koan");
            mimeTypeDics.Add(".sl", "application/x-seelogo");
            mimeTypeDics.Add(".smi", "application/smil");
            mimeTypeDics.Add(".smil", "application/smil");
            mimeTypeDics.Add(".snd", "audio/basic");
            mimeTypeDics.Add(".sol", "application/solids");
            mimeTypeDics.Add(".spc", "text/x-speech");
            mimeTypeDics.Add(".spl", "application/futuresplash");
            mimeTypeDics.Add(".spr", "application/x-sprite");
            mimeTypeDics.Add(".sprite", "application/x-sprite");
            mimeTypeDics.Add(".src", "application/x-wais-source");
            mimeTypeDics.Add(".ssi", "text/x-server-parsed-html");
            mimeTypeDics.Add(".ssm", "application/streamingmedia");
            mimeTypeDics.Add(".sst", "application/vnd.ms-pki.certstore");
            mimeTypeDics.Add(".step", "application/step");
            mimeTypeDics.Add(".stl", "application/sla");
            mimeTypeDics.Add(".stp", "application/step");
            mimeTypeDics.Add(".sv4cpio", "application/x-sv4cpio");
            mimeTypeDics.Add(".sv4crc", "application/x-sv4crc");
            mimeTypeDics.Add(".svf", "image/vnd.dwg");
            mimeTypeDics.Add(".svg", "image/svg+xml");
            mimeTypeDics.Add(".svr", "application/x-world");
            mimeTypeDics.Add(".swf", "application/x-shockwave-flash");
            mimeTypeDics.Add(".t", "application/x-troff");
            mimeTypeDics.Add(".talk", "text/x-speech");
            mimeTypeDics.Add(".tar", "application/x-tar");
            mimeTypeDics.Add(".tbk", "application/toolbook");
            mimeTypeDics.Add(".tcl", "application/x-tcl");
            mimeTypeDics.Add(".tcsh", "text/x-script.tcsh");
            mimeTypeDics.Add(".tex", "application/x-tex");
            mimeTypeDics.Add(".texi", "application/x-texinfo");
            mimeTypeDics.Add(".texinfo", "application/x-texinfo");
            mimeTypeDics.Add(".text", "text/plain");
            mimeTypeDics.Add(".tgz", "application/x-compressed");
            mimeTypeDics.Add(".tif", "image/tiff");
            mimeTypeDics.Add(".tiff", "image/tiff");
            mimeTypeDics.Add(".tr", "application/x-troff");
            mimeTypeDics.Add(".tsi", "audio/tsp-audio");
            mimeTypeDics.Add(".tsp", "application/dsptype");
            mimeTypeDics.Add(".tsv", "text/tab-separated-values");
            mimeTypeDics.Add(".turbot", "image/florian");
            mimeTypeDics.Add(".txt", "text/plain");
            mimeTypeDics.Add(".uil", "text/x-uil");
            mimeTypeDics.Add(".uni", "text/uri-list");
            mimeTypeDics.Add(".unis", "text/uri-list");
            mimeTypeDics.Add(".unv", "application/i-deas");
            mimeTypeDics.Add(".uri", "text/uri-list");
            mimeTypeDics.Add(".uris", "text/uri-list");
            mimeTypeDics.Add(".ustar", "application/x-ustar");
            mimeTypeDics.Add(".uu", "application/octet-stream");
            mimeTypeDics.Add(".uue", "text/x-uuencode");
            mimeTypeDics.Add(".vcd", "application/x-cdlink");
            mimeTypeDics.Add(".vcs", "text/x-vcalendar");
            mimeTypeDics.Add(".vda", "application/vda");
            mimeTypeDics.Add(".vdo", "video/vdo");
            mimeTypeDics.Add(".vew", "application/groupwise");
            mimeTypeDics.Add(".viv", "video/vivo");
            mimeTypeDics.Add(".vivo", "video/vivo");
            mimeTypeDics.Add(".vmd", "application/vocaltec-media-desc");
            mimeTypeDics.Add(".vmf", "application/vocaltec-media-file");
            mimeTypeDics.Add(".voc", "audio/voc");
            mimeTypeDics.Add(".vos", "video/vosaic");
            mimeTypeDics.Add(".vox", "audio/voxware");
            mimeTypeDics.Add(".vqe", "audio/x-twinvq-plugin");
            mimeTypeDics.Add(".vqf", "audio/x-twinvq");
            mimeTypeDics.Add(".vql", "audio/x-twinvq-plugin");
            mimeTypeDics.Add(".vrml", "application/x-vrml");
            mimeTypeDics.Add(".vrt", "x-world/x-vrt");
            mimeTypeDics.Add(".vsd", "application/x-visio");
            mimeTypeDics.Add(".vst", "application/x-visio");
            mimeTypeDics.Add(".vsw", "application/x-visio");
            mimeTypeDics.Add(".w60", "application/wordperfect6.0");
            mimeTypeDics.Add(".w61", "application/wordperfect6.1");
            mimeTypeDics.Add(".w6w", "application/msword");
            mimeTypeDics.Add(".wav", "audio/wav");
            mimeTypeDics.Add(".wb1", "application/x-qpro");
            mimeTypeDics.Add(".wbmp", "image/vnd.wap.wbmp");
            mimeTypeDics.Add(".web", "application/vnd.xara");
            mimeTypeDics.Add(".wiz", "application/msword");
            mimeTypeDics.Add(".wk1", "application/x-123");
            mimeTypeDics.Add(".wmf", "windows/metafile");
            mimeTypeDics.Add(".wml", "text/vnd.wap.wml");
            mimeTypeDics.Add(".wmlc", "application/vnd.wap.wmlc");
            mimeTypeDics.Add(".wmls", "text/vnd.wap.wmlscript");
            mimeTypeDics.Add(".wmlsc", "application/vnd.wap.wmlscriptc");
            mimeTypeDics.Add(".word", "application/msword");
            mimeTypeDics.Add(".wp", "application/wordperfect");
            mimeTypeDics.Add(".wp5", "application/wordperfect");
            mimeTypeDics.Add(".wp6", "application/wordperfect");
            mimeTypeDics.Add(".wpd", "application/wordperfect");
            mimeTypeDics.Add(".wq1", "application/x-lotus");
            mimeTypeDics.Add(".wri", "application/mswrite");
            mimeTypeDics.Add(".wrl", "application/x-world");
            mimeTypeDics.Add(".wrz", "x-world/x-vrml");
            mimeTypeDics.Add(".wsc", "text/scriplet");
            mimeTypeDics.Add(".wsrc", "application/x-wais-source");
            mimeTypeDics.Add(".wtk", "application/x-wintalk");
            mimeTypeDics.Add(".xbm", "image/x-xbitmap");
            mimeTypeDics.Add(".xdr", "video/x-amt-demorun");
            mimeTypeDics.Add(".xgz", "xgl/drawing");
            mimeTypeDics.Add(".xif", "image/vnd.xiff");
            mimeTypeDics.Add(".xl", "application/excel");
            mimeTypeDics.Add(".xla", "application/vnd.ms-excel");
            mimeTypeDics.Add(".xlb", "application/vnd.ms-excel");
            mimeTypeDics.Add(".xlc", "application/vnd.ms-excel");
            mimeTypeDics.Add(".xld", "application/vnd.ms-excel");
            mimeTypeDics.Add(".xlk", "application/vnd.ms-excel");
            mimeTypeDics.Add(".xll", "application/vnd.ms-excel");
            mimeTypeDics.Add(".xlm", "application/vnd.ms-excel");
            mimeTypeDics.Add(".xls", "application/vnd.ms-excel");
            mimeTypeDics.Add(".xlt", "application/vnd.ms-excel");
            mimeTypeDics.Add(".xlv", "application/vnd.ms-excel");
            mimeTypeDics.Add(".xlw", "application/vnd.ms-excel");
            mimeTypeDics.Add(".xm", "audio/xm");
            mimeTypeDics.Add(".xml", "application/xml");
            mimeTypeDics.Add(".xmz", "xgl/movie");
            mimeTypeDics.Add(".xpix", "application/x-vnd.ls-xpix");
            mimeTypeDics.Add(".xpm", "image/xpm");
            mimeTypeDics.Add(".x-png", "image/png");
            mimeTypeDics.Add(".xsr", "video/x-amt-showrun");
            mimeTypeDics.Add(".xwd", "image/x-xwd");
            mimeTypeDics.Add(".xyz", "chemical/x-pdb");
            mimeTypeDics.Add(".z", "application/x-compressed");
            mimeTypeDics.Add(".zip", "application/zip");
            mimeTypeDics.Add(".zoo", "application/octet-stream");
            mimeTypeDics.Add(".zsh", "text/x-script.zsh");
        }

        private string GetRetval(string key)
        {
            string output = "application/octet-stream";
            if (mimeTypeDics.ContainsKey(key))
                output = mimeTypeDics[key];

            return output;
        }
    }
}
