export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          code: string
          course_id: string
          course_title: string
          holder_name: string
          hours: number
          id: string
          issued_at: string
          user_id: string
        }
        Insert: {
          code?: string
          course_id: string
          course_title: string
          holder_name: string
          hours?: number
          id?: string
          issued_at?: string
          user_id: string
        }
        Update: {
          code?: string
          course_id?: string
          course_title?: string
          holder_name?: string
          hours?: number
          id?: string
          issued_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          body: string
          created_at: string
          id: string
          space_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          space_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          space_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "community_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      community_replies: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_spaces: {
        Row: {
          created_at: string
          description: string | null
          featured: boolean
          id: string
          members_count: number
          name: string
          published: boolean
          slug: string
          specialty: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          members_count?: number
          name: string
          published?: boolean
          slug: string
          specialty?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          members_count?: number
          name?: string
          published?: boolean
          slug?: string
          specialty?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          featured: boolean
          id: string
          instructor_name: string | null
          instructor_title: string | null
          level: string
          published: boolean
          slug: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          featured?: boolean
          id?: string
          instructor_name?: string | null
          instructor_title?: string | null
          level?: string
          published?: boolean
          slug: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          featured?: boolean
          id?: string
          instructor_name?: string | null
          instructor_title?: string | null
          level?: string
          published?: boolean
          slug?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_redemptions: {
        Row: {
          created_at: string
          id: string
          item_id: string
          price_credits: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          price_credits: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          price_credits?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_redemptions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_case_attempts: {
        Row: {
          case_date: string
          case_key: string
          correct: boolean
          created_at: string
          credits_awarded: number
          id: string
          user_id: string
          xp_awarded: number
        }
        Insert: {
          case_date: string
          case_key: string
          correct: boolean
          created_at?: string
          credits_awarded: number
          id?: string
          user_id: string
          xp_awarded: number
        }
        Update: {
          case_date?: string
          case_key?: string
          correct?: boolean
          created_at?: string
          credits_awarded?: number
          id?: string
          user_id?: string
          xp_awarded?: number
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          cover_url: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          featured: boolean
          id: string
          kind: string
          location: string | null
          price_cents: number
          published: boolean
          slug: string
          starts_at: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          featured?: boolean
          id?: string
          kind?: string
          location?: string | null
          price_cents?: number
          published?: boolean
          slug: string
          starts_at: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          featured?: boolean
          id?: string
          kind?: string
          location?: string | null
          price_cents?: number
          published?: boolean
          slug?: string
          starts_at?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_sources: {
        Row: {
          abstract: string | null
          added_by: string | null
          authors: string | null
          created_at: string
          doi: string | null
          embedding: string | null
          evidence_level: string | null
          external_id: string | null
          full_text: string | null
          id: string
          journal: string | null
          notes: string | null
          source_type: string
          study_design: string | null
          tags: string[]
          title: string
          updated_at: string
          url: string | null
          year: number | null
        }
        Insert: {
          abstract?: string | null
          added_by?: string | null
          authors?: string | null
          created_at?: string
          doi?: string | null
          embedding?: string | null
          evidence_level?: string | null
          external_id?: string | null
          full_text?: string | null
          id?: string
          journal?: string | null
          notes?: string | null
          source_type?: string
          study_design?: string | null
          tags?: string[]
          title: string
          updated_at?: string
          url?: string | null
          year?: number | null
        }
        Update: {
          abstract?: string | null
          added_by?: string | null
          authors?: string | null
          created_at?: string
          doi?: string | null
          embedding?: string | null
          evidence_level?: string | null
          external_id?: string | null
          full_text?: string | null
          id?: string
          journal?: string | null
          notes?: string | null
          source_type?: string
          study_design?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          url?: string | null
          year?: number | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_rewards: {
        Row: {
          created_at: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_versions: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          lesson_id: string
          snapshot: Json
          status: string | null
          title: string | null
          version: number
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          lesson_id: string
          snapshot: Json
          status?: string | null
          title?: string | null
          version: number
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          lesson_id?: string
          snapshot?: Json
          status?: string | null
          title?: string | null
          version?: number
        }
        Relationships: []
      }
      lessons: {
        Row: {
          clinical_case: Json | null
          content: string | null
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          evidence_level: string | null
          id: string
          key_points: string[]
          module_position: number
          module_title: string | null
          monograph: string | null
          position: number
          quick_ref: string | null
          refs: Json
          review_due_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          slides: Json | null
          status: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          clinical_case?: Json | null
          content?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          evidence_level?: string | null
          id?: string
          key_points?: string[]
          module_position?: number
          module_title?: string | null
          monograph?: string | null
          position?: number
          quick_ref?: string | null
          refs?: Json
          review_due_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slides?: Json | null
          status?: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          clinical_case?: Json | null
          content?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          evidence_level?: string | null
          id?: string
          key_points?: string[]
          module_position?: number
          module_title?: string | null
          monograph?: string | null
          position?: number
          quick_ref?: string | null
          refs?: Json
          review_due_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slides?: Json | null
          status?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_items: {
        Row: {
          active: boolean
          created_at: string
          description: string
          id: string
          kind: string
          price_credits: number
          stock: number | null
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          kind?: string
          price_credits: number
          stock?: number | null
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          id?: string
          kind?: string
          price_credits?: number
          stock?: number | null
          title?: string
        }
        Relationships: []
      }
      mastery_records: {
        Row: {
          created_at: string
          dimensions: Json
          gaps: string[]
          id: string
          lesson_id: string
          next_step: string | null
          persona: string
          score: number
          strengths: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          dimensions?: Json
          gaps?: string[]
          id?: string
          lesson_id: string
          next_step?: string | null
          persona: string
          score: number
          strengths?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          dimensions?: Json
          gaps?: string[]
          id?: string
          lesson_id?: string
          next_step?: string | null
          persona?: string
          score?: number
          strengths?: string[]
          user_id?: string
        }
        Relationships: []
      }
      mentor_credentials: {
        Row: {
          bio: string | null
          crm: string
          crm_uf: string
          full_name: string
          rqe: string | null
          specialty: string | null
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          bio?: string | null
          crm: string
          crm_uf: string
          full_name: string
          rqe?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          bio?: string | null
          crm?: string
          crm_uf?: string
          full_name?: string
          rqe?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      mentor_sessions: {
        Row: {
          created_at: string
          id: string
          mentor_id: string
          notes: string | null
          preferred_at: string | null
          status: string
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_id: string
          notes?: string | null
          preferred_at?: string | null
          status?: string
          topic: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_id?: string
          notes?: string | null
          preferred_at?: string | null
          status?: string
          topic?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          featured: boolean
          hourly_rate_cents: number
          id: string
          location: string | null
          name: string
          published: boolean
          rating: number
          sessions_count: number
          slug: string
          specialty: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          featured?: boolean
          hourly_rate_cents?: number
          id?: string
          location?: string | null
          name: string
          published?: boolean
          rating?: number
          sessions_count?: number
          slug: string
          specialty?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          featured?: boolean
          hourly_rate_cents?: number
          id?: string
          location?: string | null
          name?: string
          published?: boolean
          rating?: number
          sessions_count?: number
          slug?: string
          specialty?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          specialty: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      session_beat_awards: {
        Row: {
          user_id: string
          lesson_id: string
          beat: string
          xp: number
          meta: Json
          created_at: string
        }
        Insert: {
          user_id: string
          lesson_id: string
          beat: string
          xp?: number
          meta?: Json
          created_at?: string
        }
        Update: {
          user_id?: string
          lesson_id?: string
          beat?: string
          xp?: number
          meta?: Json
          created_at?: string
        }
        Relationships: []
      }
      review_cards: {
        Row: {
          case_key: string
          due_date: string
          ease: number
          id: string
          interval_days: number
          lapses: number
          last_reviewed_at: string | null
          reps: number
          user_id: string
        }
        Insert: {
          case_key: string
          due_date?: string
          ease?: number
          id?: string
          interval_days?: number
          lapses?: number
          last_reviewed_at?: string | null
          reps?: number
          user_id: string
        }
        Update: {
          case_key?: string
          due_date?: string
          ease?: number
          id?: string
          interval_days?: number
          lapses?: number
          last_reviewed_at?: string | null
          reps?: number
          user_id?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          discount_label: string | null
          featured: boolean
          id: string
          logo_url: string | null
          name: string
          published: boolean
          slug: string
          tagline: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          discount_label?: string | null
          featured?: boolean
          id?: string
          logo_url?: string | null
          name: string
          published?: boolean
          slug: string
          tagline?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          discount_label?: string | null
          featured?: boolean
          id?: string
          logo_url?: string | null
          name?: string
          published?: boolean
          slug?: string
          tagline?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          best_streak: number
          credits: number
          last_active_date: string | null
          streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          best_streak?: number
          credits?: number
          last_active_date?: string | null
          streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          best_streak?: number
          credits?: number
          last_active_date?: string | null
          streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venture_interests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          ticket_cents: number | null
          user_id: string
          venture_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          ticket_cents?: number | null
          user_id: string
          venture_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          ticket_cents?: number | null
          user_id?: string
          venture_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venture_interests_venture_id_fkey"
            columns: ["venture_id"]
            isOneToOne: false
            referencedRelation: "ventures"
            referencedColumns: ["id"]
          },
        ]
      }
      ventures: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          kind: string
          name: string
          published: boolean
          raise_target_cents: number | null
          sector: string | null
          slug: string
          stage: string | null
          status: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          kind?: string
          name: string
          published?: boolean
          raise_target_cents?: number | null
          sector?: string | null
          slug: string
          stage?: string | null
          status?: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          kind?: string
          name?: string
          published?: boolean
          raise_target_cents?: number | null
          sector?: string | null
          slug?: string
          stage?: string | null
          status?: string
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      award_daily_case: {
        Args: { _case_key: string; _correct: boolean; _user_id: string }
        Returns: Json
      }
      award_lesson: { Args: { _lesson_id: string }; Returns: Json }
      award_session_beat: {
        Args: { _lesson_id: string; _beat: string; _correct?: boolean | null }
        Returns: Json
      }
      get_daily_session_goal: { Args: never; Returns: Json }
      claim_first_admin: { Args: never; Returns: boolean }
      get_leaderboard: {
        Args: never
        Returns: {
          is_me: boolean
          name: string
          rank: number
          streak: number
          xp: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      issue_certificate: { Args: { _course_id: string }; Returns: Json }
      match_sources: {
        Args: { _embedding: string; _limit?: number }
        Returns: {
          authors: string
          doi: string
          evidence_level: string
          excerpt: string
          journal: string
          similarity: number
          title: string
          url: string
          year: number
        }[]
      }
      redeem_item: { Args: { _item_id: string }; Returns: Json }
      search_sources: {
        Args: { _limit?: number; _q: string }
        Returns: {
          authors: string
          doi: string
          evidence_level: string
          excerpt: string
          journal: string
          title: string
          url: string
          year: number
        }[]
      }
      submit_daily_case: {
        Args: { _case_key: string; _correct: boolean }
        Returns: Json
      }
      verify_certificate: {
        Args: { _code: string }
        Returns: {
          course_title: string
          holder_name: string
          hours: number
          issued_at: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member"],
    },
  },
} as const
