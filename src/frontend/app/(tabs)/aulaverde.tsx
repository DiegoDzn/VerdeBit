import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { palette, radius, spacing } from '@/constants/design';
import { useAuth } from '@/lib/auth/AuthContext';
import { getMyResources, listResources } from '@/lib/recursos/api';
import type { EducationalResource, ResourceType } from '@/lib/types';

const TYPE_ICON: Record<ResourceType, keyof typeof Ionicons.glyphMap> = {
  pdf: 'document-text',
  video: 'videocam',
  link: 'link',
  image: 'image',
  text: 'reader',
};

const TYPE_LABEL: Record<ResourceType, string> = {
  pdf: 'PDF',
  video: 'Video',
  link: 'Enlace',
  image: 'Imagen',
  text: 'Texto',
};

export default function AulaVerdeTab() {
  const { role } = useAuth();
  return role === 'teacher' ? <ResourcesTeacher /> : <ResourcesStudent />;
}

function ResourceCard({ resource }: { resource: EducationalResource }) {
  const openResource = () => {
    if (resource.url) Linking.openURL(resource.url).catch(() => {});
  };

  return (
    <TouchableOpacity style={styles.card} onPress={openResource} activeOpacity={0.8}>
      <View style={styles.iconBox}>
        <Ionicons name={TYPE_ICON[resource.resource_type]} size={24} color={palette.primary} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.type}>{TYPE_LABEL[resource.resource_type].toUpperCase()}</Text>
        <Text style={styles.title}>{resource.title}</Text>
        {resource.description ? (
          <Text style={styles.description} numberOfLines={2}>{resource.description}</Text>
        ) : null}
        {resource.subject_area ? (
          <Text style={styles.subject}>{resource.subject_area}</Text>
        ) : null}
      </View>
      <Ionicons name="open-outline" size={20} color={palette.sub} />
    </TouchableOpacity>
  );
}

function ResourcesStudent() {
  const [resources, setResources] = useState<EducationalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResources(await listResources());
    } catch {
      setError('No pudimos cargar los recursos. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={palette.sub} />
        <Text style={styles.stateText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={cargar}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (resources.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="library-outline" size={48} color={palette.sub} />
        <Text style={styles.stateText}>Aún no hay recursos disponibles.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.list}>
      <Text style={styles.heading}>Aula Verde</Text>
      <Text style={styles.subheading}>Material para aprender sobre el humedal</Text>
      {resources.map((r) => <ResourceCard key={r.id} resource={r} />)}
    </ScrollView>
  );
}

function ResourcesTeacher() {
  const { session } = useAuth();
  const router = useRouter();
  const [resources, setResources] = useState<EducationalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    setError(null);
    try {
      setResources(await getMyResources(session.user.id));
    } catch {
      setError('No pudimos cargar tus recursos.');
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.list}>
        <Text style={styles.heading}>Mis recursos</Text>
        {error ? (
          <View style={styles.centered}>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={cargar}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : resources.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="library-outline" size={40} color={palette.sub} />
            <Text style={styles.stateText}>No has publicado recursos aún.</Text>
          </View>
        ) : (
          resources.map((r) => <ResourceCard key={r.id} resource={r} />)
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/professor/resource/create')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  list: { padding: spacing.xl, gap: spacing.lg },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bg,
    padding: spacing.xxl,
    gap: spacing.md,
  },
  heading: { fontSize: 22, fontWeight: '800', color: palette.ink },
  subheading: { fontSize: 14, color: palette.sub, marginTop: -spacing.sm },
  stateText: { color: palette.sub, fontSize: 16, textAlign: 'center' },
  retryButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
    backgroundColor: palette.primary,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.line,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: palette.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 2 },
  type: { fontSize: 11, fontWeight: '800', color: palette.secondary, letterSpacing: 1 },
  title: { fontSize: 16, fontWeight: '800', color: palette.ink },
  description: { fontSize: 13, color: palette.sub },
  subject: { fontSize: 12, color: palette.olive, fontWeight: '600', marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
