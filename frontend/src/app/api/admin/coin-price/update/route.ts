import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('Coin fiyatı güncelleme API çağrısı başladı');
    
    // Kullanıcı kimliğini doğrula
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.log('Token bulunamadı');
      return NextResponse.json({ message: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }

    // İstek gövdesini al
    const data = await req.json();
    const { pricePerUnit, notes } = data;
    console.log('İstek verileri:', { pricePerUnit, notes });

    if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
      console.log('Geçersiz fiyat:', pricePerUnit);
      return NextResponse.json({ message: 'Geçerli bir fiyat girilmelidir' }, { status: 400 });
    }

    // Backend API'ye isteği ilet
    console.log('Backend API çağrısı yapılıyor');
    
    // Admin routes altındaki coin-price endpoint'ini kullan
    const backendBaseUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000').replace(/\/$/, '');
    const apiUrl = `${backendBaseUrl}/api/admin/coin-price/update`;
    
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pricePerUnit, notes }),
      cache: 'no-store'
    });
    
    console.log('API yanıt statusu:', response.status);
    
    if (!response.ok) {
      console.error('API yanıt hata:', response.status, response.statusText);
      try {
        const errorData = await response.json();
        console.error('Hata detayları:', errorData);
        return NextResponse.json(
          { message: errorData.message || 'Coin fiyatı güncellenemedi' }, 
          { status: response.status }
        );
      } catch (jsonError) {
        console.error('Hata yanıtı JSON olarak ayrıştırılamadı', jsonError);
        return NextResponse.json(
          { message: 'Coin fiyatı güncellenemedi' }, 
          { status: response.status }
        );
      }
    }
    
    const responseData = await response.json();
    console.log('API yanıt başarılı, veri:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Coin fiyatı güncelleme hatası:', error);
    return NextResponse.json(
      { message: 'Coin fiyatı güncellenirken bir hata oluştu' }, 
      { status: 500 }
    );
  }
} 