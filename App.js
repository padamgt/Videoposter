// ReelKatha — AI cartoon-reel → TikTok cockpit
// Expo / React Native. One codebase, runs on iOS and Android.
// Generation + upload are simulated locally; wire these to your .NET/HotChocolate backend.

import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Animated, Easing, Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Line } from "react-native-svg";
import {
  LayoutGrid, Plus, Users, Settings as SettingsIcon, Play, Hash, Check,
  ChevronLeft, Sparkles, Clock, Globe, Send, X, PenLine, ShieldCheck,
  Wand2, Film, Palette, Loader2, Smile, ChevronRight, Info,
} from "lucide-react-native";
import { useFonts } from "expo-font";
import {
  BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold,
} from "@expo-google-fonts/bricolage-grotesque";
import {
  Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
} from "@expo-google-fonts/inter";

/* ---------------- design tokens ---------------- */
const C = {
  ink: "#17132E", ink2: "#201A3D", ink3: "#2B2452", paper: "#F6EFE0",
  muted: "#9A93C4", line: "rgba(255,255,255,0.09)",
  marigold: "#F5B301", madder: "#E4573C", green: "#33C7A0", iris: "#7B6CF6",
};
const DISPLAY = "BricolageGrotesque_800ExtraBold";
const DISPLAY7 = "BricolageGrotesque_700Bold";
const F = { r: "Inter_400Regular", m: "Inter_500Medium", sb: "Inter_600SemiBold", b: "Inter_700Bold" };

/* ---------------- data ---------------- */
const CHARACTERS = [
  { id: "c1", name: "Bruno", emoji: "🐕", grad: ["#F6C453", "#E4573C"] },
  { id: "c2", name: "Baby Aru", emoji: "👶", grad: ["#7B6CF6", "#33C7A0"] },
  { id: "c3", name: "Mithila Maiya", emoji: "👩🏽‍🎨", grad: ["#E4573C", "#7B6CF6"] },
  { id: "c4", name: "Chotu Tiger", emoji: "🐯", grad: ["#F5B301", "#33C7A0"] },
];
const STYLES = ["Mithila folk", "2D cartoon", "Anime", "Claymation"];
const LANGS = ["Hindi", "Maithili", "Nepali", "English"];
const DURS = ["5s", "10s", "15s"];
const STATUS = {
  drafts: { label: "In TikTok drafts", color: C.iris },
  ready: { label: "Ready to post", color: C.green },
  draft: { label: "Draft", color: C.muted },
};
const SEED = [
  { id: "r1", title: "Bruno ki chai chori", char: CHARACTERS[0], style: "Mithila folk", status: "drafts", grad: CHARACTERS[0].grad, hero: "🐕", caption: "Bruno ne subah ki chai chura li ☕😂 Din ki hasi guaranteed! Full episode dekho.", tags: ["#cartoon", "#funnydog", "#hindicartoon", "#mithilaart", "#reels"], seo: 84 },
  { id: "r2", title: "Baby Aru counts stars", char: CHARACTERS[1], style: "2D cartoon", status: "ready", grad: CHARACTERS[1].grad, hero: "👶", caption: "Aru ने आसमान के saare taare gin liye ⭐ Sona time story for little ones.", tags: ["#kidscartoon", "#bedtimestory", "#animation", "#hindikids"], seo: 79 },
  { id: "r3", title: "The peacock's secret", char: CHARACTERS[2], style: "Mithila folk", status: "draft", grad: CHARACTERS[2].grad, hero: "🦚", caption: "", tags: [], seo: 0 },
];

/* ---------------- helpers ---------------- */
const buildCaption = (idea, char) =>
  `${idea ? idea.trim() : char.name + " ki ek nayi kahani"} 😄 ${char.name} is back! Poora episode dekho aur batao aage kya ho — comment karo 👇`;
const buildTags = (char, style) => {
  const map = { "Mithila folk": "#mithilaart", "2D cartoon": "#cartoon", Anime: "#anime", Claymation: "#claymation" };
  return ["#cartoon", map[style] || "#animation", "#hindicartoon", "#reels", "#" + char.name.toLowerCase().replace(/\s/g, "")];
};

/* ---------------- tiny components ---------------- */
function Spinner({ size = 16, color = "#2a1c00" }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true }));
    a.start(); return () => a.stop();
  }, []);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return <Animated.View style={{ transform: [{ rotate }] }}><Loader2 size={size} color={color} /></Animated.View>;
}

function SunMark({ size = 34 }) {
  const rays = Array.from({ length: 12 });
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="8.5" fill={C.marigold} />
      {rays.map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return <Line key={i} x1={20 + Math.cos(a) * 12} y1={20 + Math.sin(a) * 12} x2={20 + Math.cos(a) * 17} y2={20 + Math.sin(a) * 17} stroke={C.madder} strokeWidth={2.2} strokeLinecap="round" />;
      })}
      <Circle cx="20" cy="20" r="4" fill={C.ink} />
    </Svg>
  );
}

function Thumb({ grad, hero, style, small }) {
  const w = small ? 60 : 74, h = small ? 60 : 112;
  return (
    <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: w, height: h, borderRadius: small ? 16 : 12, overflow: "hidden" }}>
      {!small && <View style={{ position: "absolute", top: 6, left: 6, backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2 }}><Text style={{ fontSize: 9, color: "#fff", fontFamily: F.b }}>{style}</Text></View>}
      {!small && <View style={{ position: "absolute", top: 12, alignSelf: "center", width: 26, height: 26, borderRadius: 13, backgroundColor: C.marigold }} />}
      {!small && <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "42%", backgroundColor: "rgba(0,0,0,0.18)" }} />}
      <Text style={{ position: "absolute", bottom: small ? 12 : 8, alignSelf: "center", fontSize: small ? 28 : 30 }}>{hero}</Text>
    </LinearGradient>
  );
}

/* ---------------- root ---------------- */
export default function App() {
  const [loaded] = useFonts({
    BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold,
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
  });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: C.ink }} />;
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Root />
    </SafeAreaProvider>
  );
}

function Root() {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState("library");
  const [filter, setFilter] = useState("all");
  const [reels, setReels] = useState(SEED);
  const [toast, setToast] = useState("");

  const [char, setChar] = useState(CHARACTERS[0]);
  const [idea, setIdea] = useState("");
  const [style, setStyle] = useState("Mithila folk");
  const [lang, setLang] = useState("Hindi");
  const [dur, setDur] = useState("10s");

  const [stage, setStage] = useState(0);
  const [current, setCurrent] = useState(null);

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); } }, [toast]);

  const stages = [
    { t: "Writing the script", d: `${lang} · ${dur} · ${char.name}`, icon: PenLine },
    { t: "Designing characters & scenes", d: `${style}, locked to ${char.name}`, icon: Palette },
    { t: "Animating clips", d: "Wan 2.2 on your server", icon: Film },
    { t: "Stitching & voiceover", d: "FFmpeg assembly", icon: Wand2 },
    { t: "Writing SEO caption", d: "Keywords + hashtags", icon: Hash },
  ];

  useEffect(() => {
    if (screen !== "generating") return;
    if (stage < stages.length) { const t = setTimeout(() => setStage((s) => s + 1), 1250); return () => clearTimeout(t); }
    const t = setTimeout(() => {
      const nr = {
        id: "r" + Date.now(), title: idea ? idea.slice(0, 34) : "Untitled reel",
        char, style, status: "ready", grad: char.grad, hero: char.emoji,
        caption: buildCaption(idea, char), tags: buildTags(char, style), seo: 80 + Math.floor(Math.random() * 12),
      };
      setCurrent(nr); setReels((r) => [nr, ...r]); setScreen("preview");
    }, 700);
    return () => clearTimeout(t);
  }, [screen, stage]);

  const showTabs = ["library", "characters", "settings"].includes(screen);
  const filtered = reels.filter((r) => filter === "all" ? true : filter === "posted" ? r.status === "drafts" : r.status === filter);

  return (
    <View style={{ flex: 1, backgroundColor: C.ink, paddingTop: insets.top }}>

      {/* ---------- LIBRARY ---------- */}
      {screen === "library" && (
        <>
          <View style={s.top}>
            <View style={s.rowC}>
              <SunMark />
              <View style={{ marginLeft: 10 }}>
                <Text style={s.brand}>Reel<Text style={{ color: C.marigold }}>Katha</Text></Text>
                <Text style={s.brandSub}>cartoon reels on autopilot</Text>
              </View>
            </View>
            <View style={s.rowC}>
              <Stat n={reels.length} l="made" />
              <View style={{ width: 14 }} />
              <Stat n={reels.filter((r) => r.status === "drafts").length} l="queued" />
            </View>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
            <View style={s.seg}>
              {[["all", "All"], ["ready", "Ready"], ["posted", "In drafts"], ["draft", "Sketches"]].map(([k, l]) => (
                <TouchableOpacity key={k} style={[s.segBtn, filter === k && s.segOn]} onPress={() => setFilter(k)}>
                  <Text style={[s.segTxt, filter === k && { color: C.paper }]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {filtered.length === 0 ? (
              <View style={s.empty}><Text style={{ fontSize: 40, marginBottom: 12 }}>🎬</Text><Text style={s.emptyT}>Nothing here yet.{"\n"}Tap New reel to make one.</Text></View>
            ) : filtered.map((r) => {
              const st = STATUS[r.status] || STATUS.draft;
              return (
                <TouchableOpacity key={r.id} style={s.card} activeOpacity={0.85} onPress={() => { setCurrent(r); setScreen("preview"); }}>
                  <Thumb grad={r.grad} hero={r.hero} style={r.style} />
                  <View style={{ flex: 1, marginLeft: 13 }}>
                    <Text style={s.cardTitle}>{r.title}</Text>
                    <Text style={s.cardCap} numberOfLines={2}>{r.caption || "No caption yet — tap to generate."}</Text>
                    <View style={[s.rowC, { marginTop: 8 }]}>
                      <View style={[s.dot, { backgroundColor: st.color }]} />
                      <Text style={{ color: st.color, fontFamily: F.sb, fontSize: 11 }}>{st.label}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={[s.fab, { bottom: insets.bottom + 84 }]} activeOpacity={0.9} onPress={() => setScreen("create")}>
            <Plus size={19} color="#2a1c00" strokeWidth={2.6} /><Text style={s.fabTxt}>New reel</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ---------- CREATE ---------- */}
      {screen === "create" && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 6, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={s.back} onPress={() => setScreen("library")}><ChevronLeft size={20} color={C.paper} /><Text style={s.backTxt}>Library</Text></TouchableOpacity>
          <Text style={s.h1}>New reel</Text>
          <Text style={s.lede}>Pick who's in it and what happens. Your server writes, animates, and captions the rest.</Text>

          <FLabel icon={Smile}>Character</FLabel>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {CHARACTERS.map((c) => (
              <TouchableOpacity key={c.id} style={{ width: 78, marginRight: 11, alignItems: "center" }} onPress={() => setChar(c)}>
                <LinearGradient colors={c.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.cface, char.id === c.id && s.cfaceOn]}><Text style={{ fontSize: 34 }}>{c.emoji}</Text></LinearGradient>
                <Text style={[s.cname, char.id === c.id && { color: C.paper }]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={{ width: 78, alignItems: "center" }} onPress={() => setScreen("characters")}>
              <View style={s.cadd}><Plus size={22} color={C.muted} /></View><Text style={s.cname}>New</Text>
            </TouchableOpacity>
          </ScrollView>

          <FLabel icon={Sparkles}>What happens in this episode?</FLabel>
          <TextInput style={[s.area, { height: 86 }]} multiline textAlignVertical="top" value={idea} onChangeText={setIdea}
            placeholder={`e.g. ${char.name} tries to catch the moon in a basket…`} placeholderTextColor={C.muted} />

          <View style={{ height: 20 }} />
          <FLabel icon={Palette}>Style</FLabel>
          <Chips items={STYLES} value={style} onPick={setStyle} />

          <View style={{ height: 20 }} />
          <FLabel icon={Globe}>Language</FLabel>
          <Chips items={LANGS} value={lang} onPick={setLang} />

          <View style={{ height: 20 }} />
          <FLabel icon={Clock}>Length · always 9:16 vertical</FLabel>
          <Chips items={DURS} value={dur} onPick={setDur} />

          <View style={{ height: 26 }} />
          <TouchableOpacity style={s.cta} activeOpacity={0.9} onPress={() => { setStage(0); setScreen("generating"); }}>
            <Wand2 size={18} color="#2a1c00" /><Text style={s.ctaTxt}>Generate reel</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ---------- GENERATING ---------- */}
      {screen === "generating" && (
        <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 20 }}>
          <Text style={s.genH}>Making your reel…</Text>
          <Text style={s.genSub}>{char.name} · {style} · {dur}. This runs on your backend, not the phone.</Text>
          <View style={{ marginTop: 30 }}>
            {stages.map((st, i) => {
              const done = i < stage, active = i === stage;
              const Icon = st.icon;
              return (
                <View key={i} style={{ flexDirection: "row" }}>
                  <View style={{ width: 38, alignItems: "center" }}>
                    <View style={[s.circ, done && { backgroundColor: C.green, borderColor: C.green }, active && { backgroundColor: C.marigold, borderColor: C.marigold }]}>
                      {done ? <Check size={17} color="#06251d" strokeWidth={3} /> : active ? <Spinner /> : <Icon size={16} color={C.muted} />}
                    </View>
                    {i < stages.length - 1 && <View style={[s.pipeLine, done && { backgroundColor: C.green }]} />}
                  </View>
                  <View style={{ paddingTop: 8, paddingBottom: 26, flex: 1 }}>
                    <Text style={[s.stT, (active || done) && { color: C.paper }]}>{st.t}</Text>
                    <Text style={s.stD}>{st.d}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={[s.cta, s.ghost, { marginBottom: insets.bottom + 20 }]} onPress={() => setScreen("library")}>
            <Text style={[s.ctaTxt, { color: C.paper }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ---------- PREVIEW ---------- */}
      {screen === "preview" && current && (
        <Preview reel={current} insets={insets}
          onBack={() => setScreen("library")}
          onSend={() => { setReels((rs) => rs.map((r) => r.id === current.id ? { ...r, status: "drafts" } : r)); setToast("Sent to your TikTok drafts"); setScreen("library"); }} />
      )}

      {/* ---------- CHARACTERS ---------- */}
      {screen === "characters" && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 20, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
          <Text style={[s.brand, { fontSize: 22 }]}>Characters</Text>
          <Text style={[s.lede, { marginTop: 8 }]}>Your cast, saved once. Every reel re-uses the same reference so faces stay consistent across episodes.</Text>
          {CHARACTERS.map((c) => (
            <View key={c.id} style={s.card}>
              <Thumb grad={c.grad} hero={c.emoji} small />
              <View style={{ flex: 1, marginLeft: 13, justifyContent: "center" }}>
                <Text style={s.cardTitle}>{c.name}</Text>
                <Text style={s.cardCap}>Reference locked · used in {reels.filter((r) => r.char?.id === c.id).length} reels</Text>
              </View>
              <ChevronRight size={18} color={C.muted} style={{ alignSelf: "center" }} />
            </View>
          ))}
          <TouchableOpacity style={[s.cta, s.ghost, { marginTop: 16 }]}><Plus size={18} color={C.paper} /><Text style={[s.ctaTxt, { color: C.paper }]}>Add a character</Text></TouchableOpacity>
        </ScrollView>
      )}

      {/* ---------- SETTINGS ---------- */}
      {screen === "settings" && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 20, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
          <Text style={[s.brand, { fontSize: 22, marginBottom: 18 }]}>Settings</Text>
          <Text style={s.eyebrow}>CONNECTIONS</Text>
          <SRow t="TikTok account" d="@reelkatha · draft upload" badge="Connected" />
          <SRow t="Generation server" d="Wan 2.2 · ComfyUI API" badge="Online" />
          <Text style={[s.eyebrow, { marginTop: 22 }]}>POSTING</Text>
          <SRow t="Upload mode" d="Lands in TikTok drafts — you tap publish" chev />
          <SRow t="Mark content as AI-made" d="Required by TikTok · always on" badge="On" />
          <View style={s.note}><Info size={15} color={C.iris} /><Text style={s.noteTxt}>Fully-automatic public posting needs a pre-audited posting API. Draft mode keeps you compliant and free while you find your winning format.</Text></View>
        </ScrollView>
      )}

      {/* toast */}
      {toast ? (
        <View style={[s.toast, { bottom: insets.bottom + 90 }]}><Check size={17} color="#06251d" strokeWidth={3} /><Text style={s.toastTxt}>{toast}</Text></View>
      ) : null}

      {/* tab bar */}
      {showTabs && (
        <View style={[s.tabs, { height: 64 + insets.bottom, paddingBottom: insets.bottom }]}>
          {[["library", LayoutGrid, "Library"], ["create", Plus, "Create"], ["characters", Users, "Cast"], ["settings", SettingsIcon, "Settings"]].map(([k, Icon, l]) => {
            const on = screen === k;
            return (
              <TouchableOpacity key={k} style={s.tab} onPress={() => setScreen(k)}>
                <Icon size={21} color={on ? C.marigold : C.muted} />
                <Text style={[s.tabTxt, { color: on ? C.paper : C.muted }]}>{l}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

/* ---------------- preview screen ---------------- */
function Preview({ reel, onBack, onSend, insets }) {
  const [caption, setCaption] = useState(reel.caption);
  const [tags, setTags] = useState(reel.tags);
  const [ai, setAi] = useState(true);
  const seo = reel.seo || 82;
  const R = 22, dash = 2 * Math.PI * R;

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 6, paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={s.back} onPress={onBack}><ChevronLeft size={20} color={C.paper} /><Text style={s.backTxt}>Library</Text></TouchableOpacity>
      <Text style={[s.h1, { fontSize: 22, marginBottom: 16 }]}>{reel.title}</Text>

      <LinearGradient colors={reel.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.preview}>
        <View style={s.pvBadge}><Sparkles size={11} color="#fff" /><Text style={{ color: "#fff", fontFamily: F.b, fontSize: 10, marginLeft: 4 }}>AI cartoon</Text></View>
        <View style={{ position: "absolute", top: 34, alignSelf: "center", width: 52, height: 52, borderRadius: 26, backgroundColor: C.marigold }} />
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "38%", backgroundColor: "rgba(0,0,0,0.2)" }} />
        <Text style={{ position: "absolute", bottom: 56, alignSelf: "center", fontSize: 66 }}>{reel.hero}</Text>
        <View style={s.play}><Play size={22} color="#fff" fill="#fff" /></View>
      </LinearGradient>

      <View style={s.seo}>
        <View style={{ width: 52, height: 52 }}>
          <Svg width={52} height={52}>
            <Circle cx={26} cy={26} r={R} stroke="rgba(255,255,255,0.1)" strokeWidth={5} fill="none" />
            <Circle cx={26} cy={26} r={R} stroke={C.green} strokeWidth={5} fill="none" strokeLinecap="round"
              strokeDasharray={dash} strokeDashoffset={dash * (1 - seo / 100)} rotation={-90} originX={26} originY={26} />
          </Svg>
          <Text style={s.ringN}>{seo}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}><Text style={s.seoT}>SEO score</Text><Text style={s.seoD}>Strong hook + keywords in the first line. Good discoverability.</Text></View>
      </View>

      <FLabel icon={PenLine}>Caption</FLabel>
      <TextInput style={[s.area, { height: 100 }]} multiline textAlignVertical="top" value={caption} onChangeText={setCaption} placeholderTextColor={C.muted} />

      <View style={{ height: 20 }} />
      <FLabel icon={Hash}>Hashtags</FLabel>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {tags.map((t) => (
          <View key={t} style={s.hchip}><Text style={{ color: C.iris, fontFamily: F.sb, fontSize: 12 }}>{t}</Text>
            <TouchableOpacity onPress={() => setTags(tags.filter((x) => x !== t))} style={{ marginLeft: 4 }}><X size={12} color={C.iris} /></TouchableOpacity></View>
        ))}
        <TouchableOpacity style={s.hadd}><Text style={{ color: C.muted, fontFamily: F.sb, fontSize: 12 }}>+ add</Text></TouchableOpacity>
      </View>

      <View style={{ height: 22 }} />
      <View style={s.toggle}>
        <View style={{ flex: 1 }}>
          <View style={s.rowC}><ShieldCheck size={16} color={C.green} /><Text style={{ color: C.paper, fontFamily: F.sb, fontSize: 13.5, marginLeft: 8 }}>AI-generated content</Text></View>
          <Text style={{ color: C.muted, fontSize: 11, marginTop: 3, marginLeft: 24 }}>TikTok requires this on AI videos.</Text>
        </View>
        <TouchableOpacity style={[s.sw, { backgroundColor: ai ? C.green : C.ink3 }]} onPress={() => setAi(!ai)}>
          <View style={[s.swKnob, { left: ai ? 21 : 3 }]} />
        </TouchableOpacity>
      </View>

      <View style={s.note}><Info size={15} color={C.iris} /><Text style={s.noteTxt}>This drops into your TikTok drafts. Open TikTok to add a trending sound and publish — that keeps you fully within TikTok's rules.</Text></View>

      <TouchableOpacity style={[s.cta, { marginBottom: 12 }]} activeOpacity={0.9} onPress={onSend}><Send size={17} color="#2a1c00" /><Text style={s.ctaTxt}>Send to TikTok drafts</Text></TouchableOpacity>
      <TouchableOpacity style={[s.cta, s.ghost]} onPress={onBack}><Text style={[s.ctaTxt, { color: C.paper }]}>Save for later</Text></TouchableOpacity>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

/* ---------------- shared bits ---------------- */
const Stat = ({ n, l }) => (<View><Text style={s.statN}>{n}</Text><Text style={s.statL}>{l}</Text></View>);
const FLabel = ({ icon: Icon, children }) => (<View style={[s.rowC, { marginBottom: 10, marginLeft: 2 }]}><Icon size={14} color={C.marigold} /><Text style={{ color: C.paper, fontFamily: F.sb, fontSize: 12, marginLeft: 6 }}>{children}</Text></View>);
const Chips = ({ items, value, onPick }) => (
  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
    {items.map((it) => { const on = value === it; return (
      <TouchableOpacity key={it} style={[s.chip, on && s.chipOn]} onPress={() => onPick(it)}><Text style={[s.chipTxt, on && { color: "#2a1c00" }]}>{it}</Text></TouchableOpacity>
    ); })}
  </View>
);
const SRow = ({ t, d, badge, chev }) => (
  <View style={s.srow}>
    <View style={{ flex: 1 }}><Text style={{ color: C.paper, fontFamily: F.sb, fontSize: 13.5 }}>{t}</Text><Text style={{ color: C.muted, fontSize: 11.5, marginTop: 2 }}>{d}</Text></View>
    {badge ? <View style={s.badge}><Text style={{ color: C.green, fontFamily: F.b, fontSize: 11 }}>{badge}</Text></View> : null}
    {chev ? <ChevronRight size={18} color={C.muted} /> : null}
  </View>
);

/* ---------------- styles ---------------- */
const s = StyleSheet.create({
  rowC: { flexDirection: "row", alignItems: "center" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 4, paddingBottom: 14 },
  brand: { fontFamily: DISPLAY, fontSize: 21, color: C.paper, letterSpacing: -0.4 },
  brandSub: { fontSize: 11, color: C.muted, marginTop: 2 },
  statN: { fontFamily: DISPLAY7, fontSize: 17, color: C.paper },
  statL: { fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginTop: 3 },

  seg: { flexDirection: "row", backgroundColor: C.ink2, borderRadius: 12, padding: 3, marginTop: 6, marginBottom: 18 },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  segOn: { backgroundColor: C.ink3 },
  segTxt: { color: C.muted, fontFamily: F.sb, fontSize: 12.5 },

  card: { flexDirection: "row", backgroundColor: C.ink2, borderColor: C.line, borderWidth: 1, borderRadius: 18, padding: 11, marginBottom: 14 },
  cardTitle: { fontFamily: DISPLAY7, fontSize: 15.5, color: C.paper, marginBottom: 3 },
  cardCap: { fontSize: 12, color: C.muted, lineHeight: 17 },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },

  fab: { position: "absolute", right: 18, flexDirection: "row", alignItems: "center", backgroundColor: C.marigold, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 30, ...Platform.select({ ios: { shadowColor: C.marigold, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }, android: { elevation: 8 } }) },
  fabTxt: { fontFamily: DISPLAY7, fontSize: 14.5, color: "#2a1c00", marginLeft: 8 },

  tabs: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(23,19,46,0.98)", borderTopColor: C.line, borderTopWidth: 1, flexDirection: "row" },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 12 },
  tabTxt: { fontSize: 10, fontFamily: F.sb, marginTop: 4 },

  back: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  backTxt: { color: C.paper, fontFamily: F.sb, fontSize: 14, marginLeft: 4 },
  h1: { fontFamily: DISPLAY, fontSize: 26, color: C.paper, letterSpacing: -0.6, marginTop: 14 },
  lede: { fontSize: 13, color: C.muted, lineHeight: 19, marginTop: 4, marginBottom: 22, marginHorizontal: 2 },
  eyebrow: { fontSize: 10.5, letterSpacing: 1.6, color: C.muted, fontFamily: F.sb, marginBottom: 12, marginLeft: 2 },

  cface: { width: 78, height: 78, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "transparent" },
  cfaceOn: { borderColor: C.marigold },
  cname: { fontSize: 11, fontFamily: F.sb, marginTop: 7, color: C.muted },
  cadd: { width: 78, height: 78, borderRadius: 20, borderWidth: 1.5, borderColor: C.line, borderStyle: "dashed", backgroundColor: C.ink2, alignItems: "center", justifyContent: "center" },

  area: { backgroundColor: C.ink2, borderColor: C.line, borderWidth: 1, borderRadius: 16, padding: 14, color: C.paper, fontFamily: F.r, fontSize: 14, lineHeight: 20 },

  chip: { borderWidth: 1, borderColor: C.line, backgroundColor: C.ink2, paddingVertical: 9, paddingHorizontal: 13, borderRadius: 11, marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: C.marigold, borderColor: C.marigold },
  chipTxt: { color: C.muted, fontFamily: F.sb, fontSize: 12.5 },

  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.marigold, paddingVertical: 16, borderRadius: 16, ...Platform.select({ ios: { shadowColor: C.marigold, shadowOpacity: 0.28, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } }, android: { elevation: 6 } }) },
  ctaTxt: { fontFamily: DISPLAY7, fontSize: 16, color: "#2a1c00", marginLeft: 9 },
  ghost: { backgroundColor: C.ink2, borderWidth: 1, borderColor: C.line, ...Platform.select({ ios: { shadowOpacity: 0 }, android: { elevation: 0 } }) },

  genH: { fontFamily: DISPLAY, fontSize: 23, color: C.paper, letterSpacing: -0.4 },
  genSub: { fontSize: 13, color: C.muted, marginTop: 4, lineHeight: 19 },
  circ: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: C.ink2, borderWidth: 1.5, borderColor: C.line },
  pipeLine: { width: 2, flex: 1, backgroundColor: C.line, marginVertical: 2, minHeight: 26 },
  stT: { fontFamily: F.sb, fontSize: 14.5, color: C.muted },
  stD: { fontSize: 11.5, color: C.muted, marginTop: 2 },

  preview: { width: "100%", aspectRatio: 9 / 16, maxHeight: 340, borderRadius: 22, overflow: "hidden", marginBottom: 20 },
  pvBadge: { position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
  play: { position: "absolute", alignSelf: "center", top: "44%", width: 58, height: 58, borderRadius: 29, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },

  seo: { flexDirection: "row", alignItems: "center", backgroundColor: C.ink2, borderColor: C.line, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 20 },
  ringN: { position: "absolute", width: 52, height: 52, textAlign: "center", lineHeight: 52, fontFamily: DISPLAY7, fontSize: 15, color: C.paper },
  seoT: { fontFamily: F.sb, fontSize: 13.5, color: C.paper },
  seoD: { fontSize: 11.5, color: C.muted, marginTop: 2, lineHeight: 16 },

  hchip: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(123,108,246,0.14)", paddingVertical: 7, paddingHorizontal: 10, borderRadius: 10, marginRight: 7, marginBottom: 7 },
  hadd: { borderWidth: 1, borderColor: C.line, borderStyle: "dashed", paddingVertical: 7, paddingHorizontal: 10, borderRadius: 10, marginBottom: 7 },

  toggle: { flexDirection: "row", alignItems: "center", backgroundColor: C.ink2, borderColor: C.line, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 },
  sw: { width: 44, height: 26, borderRadius: 13, justifyContent: "center" },
  swKnob: { position: "absolute", width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff", top: 3 },

  note: { flexDirection: "row", backgroundColor: "rgba(123,108,246,0.1)", borderColor: "rgba(123,108,246,0.25)", borderWidth: 1, borderRadius: 14, padding: 13, marginBottom: 22 },
  noteTxt: { flex: 1, fontSize: 11.5, color: "#c7c0f0", lineHeight: 17, marginLeft: 9 },

  srow: { flexDirection: "row", alignItems: "center", backgroundColor: C.ink2, borderColor: C.line, borderWidth: 1, borderRadius: 14, padding: 15, marginBottom: 11 },
  badge: { backgroundColor: "rgba(51,199,160,0.15)", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20 },

  toast: { position: "absolute", left: 18, right: 18, backgroundColor: C.green, flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } }, android: { elevation: 10 } }) },
  toastTxt: { color: "#06251d", fontFamily: F.b, fontSize: 13.5, marginLeft: 9 },

  empty: { alignItems: "center", paddingVertical: 60 },
  emptyT: { color: C.muted, fontFamily: F.m, fontSize: 14, textAlign: "center", lineHeight: 21 },
});
