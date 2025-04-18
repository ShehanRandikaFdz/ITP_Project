"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import EditItemForm from "../Components/InventoryManagement/EditItemForm"
import { inventoryApi } from "../services/api"
import LoadingSpinner from "../Components/common/LoadingSpinner"
import ErrorMessage from "../Components/common/ErrorMessage"
import { useToast } from "../hooks/use-toast"

function EditItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await inventoryApi.getItemById(id)
        setItem(response.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch item details")
        setLoading(false)
      }
    }

    fetchItem()
  }, [id])

  const handleSubmit = async (formData) => {
    try {
      await inventoryApi.updateItem(id, formData)
      toast({
        title: "Success",
        description: "Item updated successfully",
        variant: "success",
      })
      navigate("/inventory")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!item) return <ErrorMessage message="Item not found" />

  return (
    <div>
      <EditItemForm item={item} onSubmit={handleSubmit} />
    </div>
  )
}

export default EditItem
