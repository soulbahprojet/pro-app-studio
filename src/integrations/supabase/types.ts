export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    price: number
                    created_at: string
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    price: number
                    created_at?: string
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    created_at?: string
                    created_by?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "products_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            orders: {
                Row: {
                    id: string
                    user_id: string | null
                    product_id: string | null
                    quantity: number
                    total_price: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    product_id?: string | null
                    quantity: number
                    total_price: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    product_id?: string | null
                    quantity?: number
                    total_price?: number
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "orders_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            inventory: {
                Row: {
                    id: string
                    product_id: string | null
                    stock: number
                    last_updated: string
                }
                Insert: {
                    id?: string
                    product_id?: string | null
                    stock: number
                    last_updated?: string
                }
                Update: {
                    id?: string
                    product_id?: string | null
                    stock?: number
                    last_updated?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "inventory_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    }
                ]
            }
            reviews: {
                Row: {
                    id: string
                    product_id: string | null
                    user_id: string | null
                    rating: number | null
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    product_id?: string | null
                    user_id?: string | null
                    rating?: number | null
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    product_id?: string | null
                    user_id?: string | null
                    rating?: number | null
                    comment?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "reviews_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "reviews_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
