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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      counsellor_bookings: {
        Row: {
          counsellor_id: string
          created_at: string
          id: string
          status: string
          updated_at: string
          user_contact: string
          user_id: string
          user_name: string
        }
        Insert: {
          counsellor_id: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_contact: string
          user_id: string
          user_name: string
        }
        Update: {
          counsellor_id?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_contact?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "counsellor_bookings_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counsellor_bookings_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      counsellor_details: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country_code: string
          created_at: string
          full_name: string
          hiring_price: number | null
          id: string
          location: string | null
          phone_number: string
          specialization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country_code: string
          created_at?: string
          full_name: string
          hiring_price?: number | null
          id?: string
          location?: string | null
          phone_number: string
          specialization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country_code?: string
          created_at?: string
          full_name?: string
          hiring_price?: number | null
          id?: string
          location?: string | null
          phone_number?: string
          specialization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      counsellor_reviews: {
        Row: {
          counsellor_id: string
          created_at: string
          id: string
          rating: number
          review_text: string | null
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          counsellor_id: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          counsellor_id?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "counsellor_reviews_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counsellor_reviews_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_details: {
        Row: {
          company_location: string | null
          company_name: string
          company_size: string | null
          created_at: string | null
          id: string
          industry: string | null
          job_title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_location?: string | null
          company_name: string
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_location?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          skill_tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          skill_tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          skill_tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      professional_transition_details: {
        Row: {
          aspired_role: string
          created_at: string
          existing_role: string
          id: string
          updated_at: string
          user_id: string
          years_of_experience: string
        }
        Insert: {
          aspired_role: string
          created_at?: string
          existing_role: string
          id?: string
          updated_at?: string
          user_id: string
          years_of_experience: string
        }
        Update: {
          aspired_role?: string
          created_at?: string
          existing_role?: string
          id?: string
          updated_at?: string
          user_id?: string
          years_of_experience?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          updated_at: string | null
          user_type: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          updated_at?: string | null
          user_type?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string | null
          user_type?: string | null
          username?: string | null
        }
        Relationships: []
      }
      qualifications: {
        Row: {
          created_at: string | null
          degree_type: string
          id: string
          is_current: boolean | null
          major: string
          school: string
          updated_at: string | null
          user_id: string
          year_of_admission: number | null
          year_of_completion: number | null
        }
        Insert: {
          created_at?: string | null
          degree_type: string
          id?: string
          is_current?: boolean | null
          major: string
          school: string
          updated_at?: string | null
          user_id: string
          year_of_admission?: number | null
          year_of_completion?: number | null
        }
        Update: {
          created_at?: string | null
          degree_type?: string
          id?: string
          is_current?: boolean | null
          major?: string
          school?: string
          updated_at?: string | null
          user_id?: string
          year_of_admission?: number | null
          year_of_completion?: number | null
        }
        Relationships: []
      }
      student_details: {
        Row: {
          created_at: string | null
          degree_type: string
          expected_completion: number | null
          id: string
          major: string
          school: string | null
          updated_at: string | null
          user_id: string
          year_of_admission: number | null
        }
        Insert: {
          created_at?: string | null
          degree_type: string
          expected_completion?: number | null
          id?: string
          major: string
          school?: string | null
          updated_at?: string | null
          user_id: string
          year_of_admission?: number | null
        }
        Update: {
          created_at?: string | null
          degree_type?: string
          expected_completion?: number | null
          id?: string
          major?: string
          school?: string | null
          updated_at?: string | null
          user_id?: string
          year_of_admission?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      counsellor_bookings_public: {
        Row: {
          counsellor_id: string | null
          created_at: string | null
          id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          counsellor_id?: string | null
          created_at?: string | null
          id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          counsellor_id?: string | null
          created_at?: string | null
          id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "counsellor_bookings_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counsellor_bookings_counsellor_id_fkey"
            columns: ["counsellor_id"]
            isOneToOne: false
            referencedRelation: "counsellor_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      counsellor_profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          hiring_price: number | null
          id: string | null
          location: string | null
          specialization: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          hiring_price?: number | null
          id?: string | null
          location?: string | null
          specialization?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          hiring_price?: number | null
          id?: string | null
          location?: string | null
          specialization?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "employer" | "job_seeker"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "employer", "job_seeker"],
    },
  },
} as const
